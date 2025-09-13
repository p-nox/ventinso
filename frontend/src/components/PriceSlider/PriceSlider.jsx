import React from 'react';
import Slider from '@mui/material/Slider';
import styles from './PriceSlider.module.css';

export default function PriceSlider({ value, onChange, onCommit, min = 0, max = 10000 }) {
    const [localValue, setLocalValue] = React.useState([value.min ?? min, value.max ?? max]);

    React.useEffect(() => {
        setLocalValue([value.min ?? min, value.max ?? max]);
    }, [value.min, value.max, min, max]);

    const handleChange = (event, newValue) => {
        setLocalValue(newValue);       
        onChange({ min: newValue[0], max: newValue[1] });
    };

    const handleChangeCommitted = (event, newValue) => {
        if (onCommit) onCommit({ min: newValue[0], max: newValue[1] });
    };

    return (
        <div className={styles.sliderWrapper}>
            <Slider
                value={localValue}
                onChange={handleChange}
                onChangeCommitted={handleChangeCommitted}
                valueLabelDisplay="off"
                min={min}
                max={max}
                disableSwap
                classes={{
                    track: styles.sliderTrack,
                    rail: styles.sliderRail,
                    thumb: styles.sliderThumb,
                }}
            />
        </div>
    );
}
