"use client";

import React, { forwardRef } from 'react';
import { IMaskInput } from 'react-imask';
import { Input } from '@/components/ui/input';

interface CnicInputProps {
  onChange: (...event: any[]) => void;
  name: string;
}

export const CnicInput = forwardRef<HTMLInputElement, CnicInputProps>((props, ref) => {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="00000-0000000-0"
      inputRef={ref as any}
      onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
      placeholder="_____-_______-_"
      as={Input}
      style={{ fontFamily: 'Roboto, sans-serif' }}
      dir="ltr"
    />
  );
});

CnicInput.displayName = 'CnicInput';
