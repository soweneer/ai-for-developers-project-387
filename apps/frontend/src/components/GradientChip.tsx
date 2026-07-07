import { Chip } from '@mantine/core';
import type { ChipProps } from '@mantine/core';
import classes from './GradientChip.module.css';

function GradientChip(props: ChipProps) {
  return <Chip {...props} classNames={classes} />;
}

export default GradientChip;
