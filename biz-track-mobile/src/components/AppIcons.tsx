import React from 'react';
import { Text } from 'react-native';

export function IconLogo() {
  return <Text style={{ fontSize: 22, color: '#ffffff' }}>📊</Text>;
}

export function IconOrders({ size = 18 }: { size?: number; color?: string }) {
  return <Text style={{ fontSize: size }}>📋</Text>;
}

export function IconQty({ size = 18 }: { size?: number; color?: string }) {
  return <Text style={{ fontSize: size }}>📦</Text>;
}

export function IconDelivered({ size = 18 }: { size?: number; color?: string }) {
  return <Text style={{ fontSize: size }}>🚚</Text>;
}

export function IconLocation({ size = 18 }: { size?: number; color?: string }) {
  return <Text style={{ fontSize: size }}>📍</Text>;
}

export function IconCustomer({ size = 15 }: { size?: number; color?: string }) {
  return <Text style={{ fontSize: size }}>👤</Text>;
}

export function IconPhone({ size = 15 }: { size?: number; color?: string }) {
  return <Text style={{ fontSize: size }}>📞</Text>;
}

export function IconMoney({ size = 20 }: { size?: number; color?: string }) {
  return <Text style={{ fontSize: size }}>💰</Text>;
}

export function IconSettings({ size = 20 }: { size?: number; color?: string }) {
  return <Text style={{ fontSize: size }}>⚙️</Text>;
}

export function IconHome({ size = 20 }: { size?: number; color?: string }) {
  return <Text style={{ fontSize: size }}>🏠</Text>;
}

export function IconMaps({ size = 14 }: { size?: number; color?: string }) {
  return <Text style={{ fontSize: size }}>🗺️</Text>;
}
