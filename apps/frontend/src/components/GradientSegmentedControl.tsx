import { SegmentedControl } from '@mantine/core';
import type { SegmentedControlProps } from '@mantine/core';
import classes from './GradientSegmentedControl.module.css';

function GradientSegmentedControl(props: SegmentedControlProps) {
  return <SegmentedControl radius="xl" size="md" {...props} classNames={classes} />;
}

export default GradientSegmentedControl;
