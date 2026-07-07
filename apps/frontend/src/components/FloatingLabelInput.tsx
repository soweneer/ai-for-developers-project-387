import { useState } from 'react';
import { TextInput } from '@mantine/core';
import type { TextInputProps } from '@mantine/core';
import classes from './FloatingLabelInput.module.css';

function FloatingLabelInput({ value, onFocus, onBlur, ...props }: TextInputProps) {
  const [focused, setFocused] = useState(false);
  const floating = (typeof value === 'string' && value.trim().length !== 0) || focused || undefined;

  return (
    <TextInput
      {...props}
      value={value}
      classNames={classes}
      autoComplete="nope"
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      data-floating={floating}
      labelProps={{ 'data-floating': floating }}
    />
  );
}

export default FloatingLabelInput;
