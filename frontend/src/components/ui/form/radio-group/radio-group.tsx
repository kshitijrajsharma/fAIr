import {
    SlRadioGroup,
    SlRadio,
} from "@shoelace-style/shoelace/dist/react/index.js";
import './radio-group.css'

type RadioGroupProps = {
    label?: string;
    value: string;
    options: {
        label: string;
        value: string;
    }[];
    onChange: (value: string) => void;
};

export const RadioGroup = ({
    label,
    value,
    options,
    onChange,
}: RadioGroupProps) => {
    return (
        <SlRadioGroup
            label={label}
            value={value}
            // @ts-expect-error bad type definition
            onSlChange={(e) => onChange(e.target.value)}
        >
            <div className="flex flex-col space-y-4">
                {options.map((option) => (
                    <SlRadio key={option.value} value={option.value}>
                        {option.label}
                    </SlRadio>
                ))}
            </div>
        </SlRadioGroup>
    );
};
