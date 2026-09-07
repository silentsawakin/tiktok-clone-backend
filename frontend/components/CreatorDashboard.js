import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';

export default function CreatorDashboard({ userId }) {
  const [earnings, setEarnings] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [totalGifts, setTotalGifts] = useState(0);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`http://your-backend-url:5000/api/creators/${userId}/dashboard`);
      const data = await response.json();
      setEarnings(data.earnings);
      setFollowers(data.followers);
      setTotalGifts(data.totalGifts);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const withdrawFunds = async () => {
    Alert.prompt(
      'Withdraw Funds',
      `You have $${earnings} available. Enter amount to withdraw:`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Withdraw',
          onPress: async (amount) => {
            try {
              const response = await fetch('http://your-backend-url:5000/api/payments/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, amount: parseFloat(amount) })
              });
              if (response.ok) {
                Alert.alert('Success', 'Funds transferred to your account!');
                fetchDashboardData();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to process withdrawal');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 15, paddingVertical: 20, backgroundColor: '#1a1a1a' }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
          Creator Dashboard
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15 }}>
        <View style={{ alignItems: 'center', backgroundColor: '#1a1a1a', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 10, flex: 0.48 }}>
          <Text style={{ color: '#FFD700', fontSize: 28, fontWeight: 'bold' }}>${earnings.toFixed(2)}</Text>
          <Text style={{ color: '#999', fontSize: 12, marginTop: 5 }}>Total Earnings</Text>
        </View>

        <View style={{ alignItems: 'center', backgroundColor: '#1a1a1a', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 10, flex: 0.48 }}>
          <Text style={{ color: '#FF0050', fontSize: 28, fontWeight: 'bold' }}>{followers}</Text>
          <Text style={{ color: '#999', fontSize: 12, marginTop: 5 }}>Followers</Text>
        </View>
      </View>

      {/* Gifts Stats */}
      <View style={{ marginHorizontal: 15, marginVertical: 10, backgroundColor: '#1a1a1a', paddingVertical: 15, paddingHorizontal: 15, borderRadius: 10 }}>
        <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Gifts Received: {totalGifts}</Text>
      </View>

      {/* Recent Activity */}
      <View style={{ marginHorizontal: 15, marginVertical: 10 }}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Recent Gifts</Text>
        {stats.length > 0 ? (
          stats.map((stat, idx) => (
            <View key={idx} style={{ backgroundColor: '#1a1a1a', paddingVertical: 10, paddingHorizontal: 15, marginBottom: 8, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#fff' }}>
                {stat.emoji} from {stat.username}
              </Text>
              <Text style={{ color: '#FFD700' }}>+${stat.value}</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: '#999' }}>No gifts yet. Start a live stream!</Text>
        )}
      </View>

      {/* Withdraw Button */}
      <TouchableOpacity
        onPress={withdrawFunds}
        style={{
          marginHorizontal: 15,
          marginVertical: 20,
          backgroundColor: '#FF0050',
          paddingVertical: 15,
          borderRadius: 10,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          Withdraw Earnings 💳
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
