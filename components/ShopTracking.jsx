import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const STEPS_KEYS = [
  'confirmed',
  'prepared',
  'outDelivery',
  'delivered',
];

const COLORS = {
  done: '#4CAF50',
  active: '#FFA726',
  pending: '#BDBDBD',
};

export default function OrderTracking({ status, prepared }) {
  const { t } = useTranslation('shoptracking');

  const isFinal = status === 'Delivered';
  let currentIndex;
  if (isFinal) currentIndex = STEPS_KEYS.length;
  else if (status === 'In Transit') currentIndex = 2;
  else if (prepared) currentIndex = 1;
  else if (status === 'Confirmed') currentIndex = 0;
  else currentIndex = -1;

  return (
    <View style={styles.container}>
      {STEPS_KEYS.map((key, idx) => {
        const isDone = isFinal || idx < currentIndex;
        const isActive = !isFinal && idx === currentIndex;
        const iconName = isDone
          ? 'check-circle'
          : isActive
            ? 'radio-button-checked'
            : 'radio-button-unchecked';
        const iconColor = isDone
          ? COLORS.done
          : isActive
            ? COLORS.active
            : COLORS.pending;

        return (
          <React.Fragment key={key}>
            <View style={styles.step}>
              <MaterialIcons name={iconName} size={28} color={iconColor} />
              <Text style={[styles.label, { color: iconColor }]}>
                {t(key)}
              </Text>
            </View>

            {idx < STEPS_KEYS.length - 1 && (
              <View
                style={[
                  styles.connector,
                  { backgroundColor: idx < currentIndex || isFinal ? COLORS.done : COLORS.pending },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  step: {
    alignItems: 'center',
    width: 80,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
  connector: {
    height: 2,
    flex: 1,
    marginHorizontal: 4,
  },
});
