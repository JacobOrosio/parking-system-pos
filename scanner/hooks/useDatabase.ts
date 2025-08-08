import { Alert, Linking } from 'react-native';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseAsync('transaction.db');

export const useDatabase = () => {
    const [loading, setLoading] = useState(false);
    const [isDbInitialized, setIsDbInitialized] = useState(false);

    useEffect(() => {
        const initializeDatabase = async () => {
            try {
                setLoading(true);
                const dbInstance = await db;
                await dbInstance.execAsync(`
                    CREATE TABLE IF NOT EXISTS transactions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        amount REAL NOT NULL,
                        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
                    );
                `);
                setIsDbInitialized(true);
            } catch (error) {
                console.error('Error initializing database:', error);
            } finally {
                setLoading(false);
            }
        };
        initializeDatabase();
    }, []);

    const addTransaction = async (amount: number) => {
        try {
            const dbInstance = await db;
            await dbInstance.runAsync('INSERT INTO transactions (amount) VALUES (?)', [amount]);
        } catch (error) {
            console.error('Error adding transaction:', error);
        }
    };

    const getAllTransactions = async () => {
        try {
            const dbInstance = await db;
            return await dbInstance.getAllAsync<{ id: number; amount: number; createdAt: string }>(
                'SELECT * FROM transactions ORDER BY createdAt ASC',
            );
        } catch (error) {
            console.error('Error getting transactions:', error);
            return [];
        }
    };

    const getTotalTransactions = async (): Promise<number> => {
        try {
            const dbInstance = await db;
            const result = await dbInstance.getFirstAsync<{ total: number }>(
                'SELECT SUM(amount) as total FROM transactions',
            );
            return result?.total ?? 0;
        } catch (error) {
            console.error('Error getting total transactions:', error);
            return 0;
        }
    };

    const clearTransactions = async () => {
        try {
            const dbInstance = await db;
            await dbInstance.runAsync('DELETE FROM transactions');
        } catch (error) {
            console.error('Error clearing transactions:', error);
        }
    };

    // 🔹 Print before logout — styled like your handlePrintTicket
    const requestLogoutWithPrint = async (logoutFn: () => void) => {
        try {
            const transactions = await getAllTransactions();
            const total = await getTotalTransactions();

            if (transactions.length === 0) {
                Alert.alert('No transactions to print.');
                return;
            }

            // Create transaction list
            let transactionLines = '';
            transactions.forEach((t) => {
                const time = dayjs(t.createdAt).format('h:mm:ss A');
                transactionLines += `${time}  $${t.amount.toFixed(2)}\n`;
            });

            // ESC/POS text formatting
            const text =
                '\x1B\x40' + // Initialize printer
                '\x1B\x61\x01' + // Center alignment
                '================================\n' +
                '\x1B\x21\x10' + // Double height text
                'SHIFT REPORT\n' +
                '\x1B\x21\x00' +
                '================================\n' +
                'Date: ' +
                dayjs().format('YYYY-MM-DD') +
                '\n' +
                '================================\n' +
                '\x1B\x61\x00' + // Left align
                transactionLines +
                '--------------------------------\n' +
                'TOTAL: $' +
                total.toFixed(2) +
                '\n' +
                '================================\n' +
                '\x1B\x61\x01' +
                'End of Shift\n' +
                '\x1D\x56\x41\x03'; // Cut paper

            // Send to RawBT
            await Linking.openURL('rawbt:' + encodeURIComponent(text));

            // ✅ If we got here, printing succeeded → logout
            await clearTransactions();
            logoutFn();
        } catch (error) {
            console.error('Error printing before logout:', error);
            Alert.alert('Error', 'Printing failed. Logout cancelled.');
        }
    };

    return {
        loading,
        isDbInitialized,
        addTransaction,
        getAllTransactions,
        getTotalTransactions,
        clearTransactions,
        requestLogoutWithPrint,
    };
};
