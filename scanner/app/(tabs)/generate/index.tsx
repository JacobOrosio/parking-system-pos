import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Modal,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    Linking,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import dayjs from 'dayjs';
import { useMutation } from '@tanstack/react-query';
import { customerParking } from '@/api/mutations/parking';
import { useSession } from '@/context/ctx';
import { ScrollView } from 'react-native-gesture-handler';
import { useDatabase } from '@/hooks/useDatabase';

export default function TicketGenerator() {
    const { user, signOut } = useSession();
    const [vehicleType, setVehicleType] = useState<'car' | 'motorcycle'>('car');
    const [isPWD, setIsPWD] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const vehicleTypeOptions = [
        { label: '🚗 Car', value: 'car' },
        { label: '🏍️ Motorcycle', value: 'motorcycle' },
    ];

    const { requestLogoutWithPrint } = useDatabase();

    const createTicket = useMutation({
        mutationFn: customerParking,
        onSuccess: async (data) => {
            setShowValidation(false);
            // Reset isPWD to false after successful ticket creation
            setIsPWD(false);
            await handlePrintTicket(
                data.ticket.id,
                dayjs(data.ticket.entryTime).format('YYYY-MM-DD HH:mm:ss'),
            );
        },
        onError: (error) => {
            console.error('Failed to create ticket:', error);
            // Reset isPWD to false even on error
            setIsPWD(false);
        },
    });

    const handleGenerateTicket = () => {
        if (!user) return null;
        createTicket.mutate({
            issuedById: user.id,
            vehicleType,
            isPWD,
        });
    };

    const handlePrintTicket = async (qrValue: string, date: string) => {
        try {
            // ESC/POS QR code command structure
            const qrCodeCommand =
                // Set QR code model
                '\x1D\x28\x6B\x04\x00\x31\x41\x32\x00' + // GS ( k <len> 49 65 50 0 (Model 2)
                // Set QR code size
                '\x1D\x28\x6B\x03\x00\x31\x43\x08' + // GS ( k <len> 49 67 n (n=8, larger size)
                // Set error correction level (M=49)
                '\x1D\x28\x6B\x03\x00\x31\x45\x31' + // GS ( k <len> 49 69 49 (M level)
                // Store QR code data
                '\x1D\x28\x6B' +
                String.fromCharCode(qrValue.length + 3) + // Data length (low byte)
                '\x00\x31\x50\x30' + // GS ( k <len> 49 80 48
                qrValue + // QR code data
                // Print QR code
                '\x1D\x28\x6B\x03\x00\x31\x51\x30'; // GS ( k <len> 49 81 48

            // Get current date and format entry time
            const currentDate = new Date().toLocaleDateString();
            const vehicleTypeDisplay = vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1);

            // Format entry time to 12-hour format without date
            const entryTimeFormatted = dayjs(date).format('h:mm:ss A');

            // Create the parking ticket text command
            const text =
                '\x1B\x40' + // Initialize printer
                '\x1B\x61\x01' + // Center alignment
                '================================\n' +
                '\x1B\x21\x10' + // Double height text
                'NOVAPARKING TICKET\n' +
                '\x1B\x21\x00' + // Normal text
                '================================\n' +
                '\x1B\x61\x00' + // Left alignment
                'Date: ' +
                currentDate +
                '\n' +
                'Vehicle Type: ' +
                vehicleTypeDisplay +
                '\n' +
                'Entry Time: ' +
                entryTimeFormatted +
                '\n' +
                '================================\n' +
                'Please  Show this QR code when' +
                '\n' +
                'exiting the parking area.\n' +
                '\n' +
                '\x1B\x61\x01' + // Center alignment for QR code
                qrCodeCommand + // Add QR code
                '\n\n' + // Space after QR code
                '\x1B\x61\x00' + // Reset to left alignment
                '\n' +
                'Thank you for parking with us!\n' +
                '================================\n' +
                '\x1D\x56\x41\x03'; // Cut paper

            // Send to RawBT
            await Linking.openURL('rawbt:' + encodeURIComponent(text));
        } catch (error) {
            console.error(error);
            Alert.alert(
                'Error',
                'Failed to send print command. Ensure RawBT is installed and printer is paired.',
            );
        }
    };

    const handleLogout = async () => {
        requestLogoutWithPrint(signOut);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white px-6 py-4 shadow-sm border-b border-gray-100">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-2xl font-bold text-gray-900">ParkPOS</Text>
                        <Text className="text-sm text-gray-500">Ticket Generator</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => handleLogout()}
                        className="bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
                        <Text className="text-red-600 font-semibold">Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView>
                <KeyboardAvoidingView
                    className="flex-1"
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
                    <View className="flex-1 px-6 items-center justify-center py-6">
                        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <View className="items-center mb-8">
                                <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-3">
                                    <Text className="text-2xl">🎟️</Text>
                                </View>
                                <Text className="text-2xl font-bold text-gray-900 mb-1">
                                    Generate Parking Ticket
                                </Text>
                                <Text className="text-gray-500 text-center">
                                    Enter vehicle details to create a new parking ticket
                                </Text>
                            </View>

                            <View className="mb-6">
                                <Text className="text-base font-semibold text-gray-700 mb-3">
                                    Vehicle Type
                                </Text>
                                <View className="flex-row gap-3">
                                    {vehicleTypeOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            className={`flex-1 py-4 px-4 rounded-xl border-2 ${
                                                vehicleType === option.value
                                                    ? 'bg-orange-50 border-orange-400'
                                                    : 'bg-gray-50 border-gray-200'
                                            }`}
                                            onPress={() =>
                                                setVehicleType(option.value as 'car' | 'motorcycle')
                                            }>
                                            <Text
                                                className={`text-center font-semibold text-base ${
                                                    vehicleType === option.value
                                                        ? 'text-orange-700'
                                                        : 'text-gray-600'
                                                }`}>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* PWD/Senior Button */}
                            <View className="mb-8">
                                <Text className="text-base font-semibold text-gray-700 mb-3">
                                    Special Rate
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setIsPWD(!isPWD)}
                                    className={`py-4 px-4 rounded-xl border-2 ${
                                        isPWD
                                            ? 'bg-blue-50 border-blue-400'
                                            : 'bg-gray-50 border-gray-200'
                                    }`}>
                                    <View className="flex-row items-center justify-center">
                                        <Text className="text-lg mr-2">♿</Text>
                                        <Text
                                            className={`font-semibold text-base ${
                                                isPWD ? 'text-blue-700' : 'text-gray-600'
                                            }`}>
                                            PWD / Senior Citizen
                                        </Text>
                                        {isPWD && (
                                            <View className="ml-2 w-5 h-5 bg-blue-500 rounded-full items-center justify-center">
                                                <Text className="text-white text-xs font-bold">
                                                    ✓
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                onPress={handleGenerateTicket}
                                className={`py-4 rounded-xl items-center shadow-sm ${
                                    !createTicket.isPending
                                        ? 'bg-orange-500 active:bg-orange-600'
                                        : 'bg-gray-300'
                                }`}
                                disabled={createTicket.isPending}>
                                <Text className="text-white text-lg font-bold">
                                    {createTicket.isPending
                                        ? 'Generating...'
                                        : 'Generate QR Ticket'}
                                </Text>
                            </TouchableOpacity>

                            <View className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <Text className="text-blue-800 text-sm text-center font-medium">
                                    💡 Ticket will be generated with current timestamp
                                    {isPWD && '\n🎯 PWD/Senior discount will be applied'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>
    );
}
