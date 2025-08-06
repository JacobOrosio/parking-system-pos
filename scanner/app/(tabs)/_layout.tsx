import { Tabs } from 'expo-router';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

export default function AppLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#00473C',
                tabBarInactiveTintColor: 'gray', // Optional: define inactive color
                tabBarLabelStyle: { fontSize: 14 },
                headerShown: false,
            }}>
            <Tabs.Screen
                name="generate/index"
                options={{
                    title: 'Generate',
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="printer" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="scanner/index"
                options={{
                    title: 'Scan',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="qr-code-scanner" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
