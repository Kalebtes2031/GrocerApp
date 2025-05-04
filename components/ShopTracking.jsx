import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const STEPS = ['Confirmed', 'Prepared', 'Out Delivery', 'Delivered'];
const COLORS = {
  done:     '#4CAF50',  // green
  active:   '#FFA726',  // orange
  pending:  '#BDBDBD',  // grey
};

export default function OrderTracking({ status, prepared }) {
  // Determine current step index, with Delivered marking completion
  const isFinal = status === 'Delivered';
  let currentIndex;
  if (isFinal)               currentIndex = STEPS.length;
  else if (status === 'In Transit') currentIndex = 2;
  else if (prepared)         currentIndex = 1;
  else if (status === 'Confirmed')  currentIndex = 0;
  else                        currentIndex = -1;

  return (
    <View style={styles.container}>
      {STEPS.map((step, idx) => {
        // All previous and/or final are marked done
        const isDone   = isFinal || idx < currentIndex;
        // Only non-final current step is active
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
          <React.Fragment key={step}>
            {/* Step icon + label */}
            <View style={styles.step}>
              <MaterialIcons name={iconName} size={28} color={iconColor} />
              <Text style={[styles.label, { color: iconColor }]}>
                {step}
              </Text>
            </View>

            {/* Connector line (omit after last) */}
            {idx < STEPS.length - 1 && (
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
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  step: {
    alignItems: 'center',
    width:      80,
  },
  label: {
    marginTop:  4,
    fontSize:   12,
    textAlign:  'center',
  },
  connector: {
    height:           2,
    flex:             1,
    marginHorizontal: 4,
  },
});
