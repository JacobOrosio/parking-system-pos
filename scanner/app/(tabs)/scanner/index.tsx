import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
    SafeAreaView,
    Linking,
} from 'react-native';
import { CameraView, Camera, BarcodeScanningResult } from 'expo-camera';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getTicketDetails } from '@/api/queries/parking';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { payParking } from '@/api/mutations/parking';
import { useSession } from '@/context/ctx';

dayjs.extend(duration);

export default function TicketScanner() {
    const { user } = useSession();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isProgress, setIsProgress] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [ticketId, setTicketId] = useState('');

    useEffect(() => {
        const requestPermission = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        requestPermission();
    }, []);

    const {
        data: ticketData,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['ticketDetails', ticketId],
        queryFn: async () => {
            if (!ticketId) return null;
            const result = await getTicketDetails(ticketId);
            return result;
        },
        enabled: false,
    });

    const payTicket = useMutation({
        mutationFn: payParking,
        onSuccess: async () => {
            console.log('Successfully pay ticket:');
            await handlePrintReceipt();
            Alert.alert('Success', 'Successfully pay ticket');
            setScanned(false);
            setTicketId('');
            setIsProgress(false);
        },
        onError: (error) => {
            console.error('Failed to create ticket:', error);
            setIsProgress(false);
        },
    });

    useEffect(() => {
        if (ticketId && !isProgress) {
            setIsProgress(true);
            refetch()
                .then((result) => {
                    const data = result.data;

                    // Handle case where backend returns a message (invalid QR or already checked out)
                    if (data && data.message) {
                        Alert.alert('Notice', data.message);
                        setScanned(false);
                        setTicketId('');
                        setIsProgress(false);
                        return;
                    }

                    // Handle case where no data is returned
                    if (!data) {
                        Alert.alert('Error', 'Invalid QR code');
                        setScanned(false);
                        setTicketId('');
                        setIsProgress(false);
                        return;
                    }

                    // If we reach here, we have valid ticket data
                    setIsProgress(false);
                })
                .catch((error) => {
                    console.error('Error fetching ticket:', error);
                    Alert.alert('Error', 'Failed to fetch ticket details');
                    setScanned(false);
                    setTicketId('');
                    setIsProgress(false);
                });
        }
    }, [ticketId]);

    const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
        // Prevent scanning if already in progress or already scanned
        if (isProgress || scanned) {
            return;
        }

        if (!data) {
            Alert.alert('Invalid QR Code', 'No data found.');
            return;
        }

        setScanned(true);
        setTicketId(data);
    };

    const getDuration = (entry: string) => {
        const now = dayjs();
        const entryTime = dayjs(entry);
        const diffInMinutes = now.diff(entryTime, 'minute');
        const durationText = dayjs.duration(now.diff(entryTime)).format('HH:mm:ss');
        return { diffInMinutes, durationText };
    };

    const calculateFee = () => {
        if (!ticketData) return 0;

        const { vehicleType, entryTime } = ticketData;
        const { diffInMinutes } = getDuration(entryTime);

        if (vehicleType === 'Motorcycle') {
            return 30;
        }

        const baseRate = 30;
        const extraHourRate = 20;
        const baseMinutes = 180;

        if (diffInMinutes <= baseMinutes) {
            return baseRate;
        }

        const extraMinutes = diffInMinutes - baseMinutes;
        const extraHours = Math.ceil(extraMinutes / 60);

        return baseRate + extraHours * extraHourRate;
    };

    const handlePrintReceipt = async () => {
        try {
            const currentDate = new Date().toLocaleDateString();
            const currentTime = new Date().toLocaleTimeString();
            const vehicleIcon = ticketData.vehicleType === 'Car' ? '🚗' : '🏍️';
            const entryTimeFormatted = dayjs(ticketData.entryTime).format('h:mm:ss A');
            const exitTimeFormatted = dayjs().format('h:mm:ss A');
            const totalFee = calculateFee();
            const { durationText } = getDuration(ticketData.entryTime);

            // Create the parking receipt text command
            const text =
                '\x1B\x40' + // Initialize printer
                '\x1B\x61\x01' + // Center alignment
                '================================\n' +
                '\x1B\x21\x10' + // Double height text
                'PARKING RECEIPT\n' +
                '\x1B\x21\x00' + // Normal text
                '================================\n' +
                'Date: ' +
                currentDate +
                '\n' +
                'Time: ' +
                currentTime +
                '\n' +
                'Receipt ID: ' +
                ticketId +
                '\n' +
                '================================\n' +
                '\x1B\x61\x00' + // Left alignment
                'Vehicle Type: ' +
                vehicleIcon +
                ' ' +
                ticketData.vehicleType +
                '\n' +
                'Entry Time: ' +
                entryTimeFormatted +
                '\n' +
                'Exit Time: ' +
                exitTimeFormatted +
                '\n' +
                'Duration: ' +
                durationText +
                '\n' +
                '================================\n' +
                '\x1B\x61\x01' + // Center alignment
                '\x1B\x21\x08' + // Double width text
                'TOTAL AMOUNT\n' +
                '\x1B\x21\x20' + // Double height and width
                '₱' +
                totalFee.toFixed(2) +
                '\n' +
                '\x1B\x21\x00' + // Normal text
                '================================\n' +
                '\x1B\x61\x00' + // Left alignment
                'Payment Status: PAID\n' +
                'Payment Method: Cash\n' +
                '\x1B\x61\x01' + // Center alignment
                'Thank you for parking with us!\n' +
                'Please come again.\n' +
                '\x1D\x56\x41\x03'; // Cut paper

            // Send to RawBT
            await Linking.openURL('rawbt:' + encodeURIComponent(text));
            Alert.alert('Success', 'Receipt sent to RawBT for printing!');
        } catch (error) {
            console.error(error);
            Alert.alert(
                'Error',
                'Failed to send print command. Ensure RawBT is installed and printer is paired.',
            );
        }
    };

    if (hasPermission === null) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 justify-center items-center px-6">
                    <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 items-center">
                        <ActivityIndicator size="large" color="#f97316" className="mb-4" />
                        <Text className="text-lg font-semibold text-gray-900 mb-2">
                            Setting up Camera
                        </Text>
                        <Text className="text-gray-500 text-center">
                            Requesting camera permission...
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    if (hasPermission === false) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 justify-center items-center px-6">
                    <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 items-center">
                        <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
                            <Text className="text-2xl">📷</Text>
                        </View>
                        <Text className="text-lg font-semibold text-gray-900 mb-2">
                            Camera Access Required
                        </Text>
                        <Text className="text-gray-500 text-center mb-4">
                            Please allow camera access to scan QR codes
                        </Text>
                        <TouchableOpacity className="bg-orange-500 px-6 py-3 rounded-xl">
                            <Text className="text-white font-semibold">Open Settings</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    const handlePayParking = () => {
        if (isProgress) return; // Prevent multiple payment attempts

        setIsProgress(true); // Set progress when starting payment
        const { diffInMinutes } = getDuration(ticketData.entryTime);
        const totalFee = calculateFee();
        if (!user) return null;
        payTicket.mutate({
            checkedOutById: user.id,
            ticketId: ticketId,
            durationMins: diffInMinutes,
            totalFee,
        });
    };

    const handleCloseModal = () => {
        if (isProgress) return; // Prevent closing during progress

        setScanned(false);
        setTicketId('');
        setIsProgress(false);
    };

    return (
        <View className="flex-1 bg-gray-900">
            {/* Header Overlay */}
            <SafeAreaView className="absolute top-0 left-0 right-0 z-10">
                <View className="bg-black/50 px-6 py-4">
                    <View className="flex-row items-center justify-center">
                        <View className="w-8 h-8 bg-orange-500 rounded-full items-center justify-center mr-3">
                            <Text className="text-white text-sm font-bold">📱</Text>
                        </View>
                        <Text className="text-white text-lg font-bold">QR Scanner</Text>
                    </View>
                    <Text className="text-gray-300 text-center text-sm mt-1">
                        Position QR code within the frame
                    </Text>
                </View>
            </SafeAreaView>

            <CameraView
                facing="back"
                onBarcodeScanned={scanned || isProgress ? undefined : handleBarCodeScanned}
                style={{ height: '100%', width: '100%' }}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            />

            {/* Scanning Frame */}
            {!scanned && !isProgress && (
                <View className="absolute inset-0 justify-center items-center">
                    <View className="w-64 h-64 relative">
                        {/* Corner frames */}
                        <View className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-orange-400 rounded-tl-xl" />
                        <View className="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-orange-400 rounded-tr-xl" />
                        <View className="absolute bottom-0 left-0 w-12 h-12 border-l-4 border-b-4 border-orange-400 rounded-bl-xl" />
                        <View className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-orange-400 rounded-br-xl" />

                        {/* Center guide */}
                        <View className="absolute inset-0 justify-center items-center">
                            <View className="w-16 h-16 border-2 border-orange-400/50 rounded-lg" />
                        </View>
                    </View>

                    {/* Instructions */}
                    <View className="absolute bottom-32 left-6 right-6">
                        <View className="bg-black/70 rounded-2xl p-4">
                            <Text className="text-white text-center font-semibold mb-1">
                                Ready to Scan
                            </Text>
                            <Text className="text-gray-300 text-center text-sm">
                                Hold steady and position the QR code within the frame
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Loading overlay while processing */}
            {isProgress && !scanned && (
                <View className="absolute inset-0 bg-black/70 justify-center items-center">
                    <View className="bg-white rounded-2xl p-8 items-center shadow-xl">
                        <ActivityIndicator size="large" color="#f97316" className="mb-4" />
                        <Text className="text-gray-900 font-semibold text-lg">
                            Processing QR Code
                        </Text>
                        <Text className="text-gray-500 text-sm mt-1">Please wait...</Text>
                    </View>
                </View>
            )}

            {/* Payment Modal */}
            <Modal
                visible={scanned}
                animationType="slide"
                transparent
                onRequestClose={handleCloseModal}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl shadow-2xl">
                        {/* Modal Header */}
                        <View className="bg-orange-50 px-6 py-4 rounded-t-3xl border-b border-orange-100">
                            <View className="flex-row items-center justify-center">
                                <View className="w-8 h-8 bg-orange-500 rounded-full items-center justify-center mr-3">
                                    <Text className="text-white text-sm">🎫</Text>
                                </View>
                                <Text className="text-xl font-bold text-orange-900">
                                    Parking Payment
                                </Text>
                            </View>
                        </View>

                        <View className="px-6 py-6">
                            {isLoading || isProgress ? (
                                <View className="items-center py-8">
                                    <ActivityIndicator
                                        size="large"
                                        color="#f97316"
                                        className="mb-4"
                                    />
                                    <Text className="text-gray-600 font-medium">
                                        Loading ticket details...
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    {/* Ticket Details Card */}
                                    <View className="bg-gray-50 rounded-xl p-4 mb-6">
                                        <View className="flex-row justify-between items-center mb-3">
                                            <Text className="text-gray-600 font-medium">
                                                Vehicle Type
                                            </Text>
                                            <Text className="text-gray-900 font-semibold capitalize">
                                                {ticketData?.vehicleType}
                                            </Text>
                                        </View>
                                        <View className="flex-row justify-between items-center mb-3">
                                            <Text className="text-gray-600 font-medium">
                                                Entry Time
                                            </Text>
                                            <Text className="text-gray-900 font-mono text-sm">
                                                {dayjs(ticketData?.entryTime).format(
                                                    'MM/DD hh:mm A',
                                                )}
                                            </Text>
                                        </View>
                                        <View className="flex-row justify-between items-center mb-3">
                                            <Text className="text-gray-600 font-medium">
                                                Parking Duration
                                            </Text>
                                            <Text className="text-gray-900 font-mono font-semibold">
                                                {getDuration(ticketData?.entryTime).durationText}
                                            </Text>
                                        </View>
                                        <View className="border-t border-gray-200 pt-3 mt-3">
                                            <View className="flex-row justify-between items-center">
                                                <Text className="text-xl font-bold text-gray-900">
                                                    Total Fee
                                                </Text>
                                                <Text className="text-2xl font-bold text-orange-600">
                                                    ₱{calculateFee().toFixed(2)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Action Buttons */}
                                    <View className="flex-row gap-3">
                                        <TouchableOpacity
                                            onPress={handleCloseModal}
                                            disabled={isProgress}
                                            className={`flex-1 py-4 rounded-xl border-2 ${
                                                isProgress
                                                    ? 'bg-gray-100 border-gray-200'
                                                    : 'bg-white border-gray-300 active:bg-gray-50'
                                            }`}>
                                            <Text
                                                className={`text-center font-semibold ${
                                                    isProgress ? 'text-gray-400' : 'text-gray-700'
                                                }`}>
                                                Cancel
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={handlePayParking}
                                            disabled={isProgress}
                                            className={`flex-1 py-4 rounded-xl ${
                                                isProgress
                                                    ? 'bg-gray-400'
                                                    : 'bg-orange-500 active:bg-orange-600'
                                            }`}>
                                            <Text className="text-white text-center font-bold text-lg">
                                                {isProgress ? 'Processing...' : 'Process Payment'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
