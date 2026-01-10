import DatePicker, { registerLocale } from 'react-datepicker'
import { vi, enUS } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'
import './CustomDatePicker.css'
import { useTranslation } from '../../contexts/LanguageContext'
import { useThemeMode } from '../../contexts/ThemeContext'
import { useEffect, forwardRef } from 'react'
import { TextField, InputAdornment, Box } from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'

// Register locales
registerLocale('vn', vi)
registerLocale('en', enUS)

interface CustomDatePickerProps {
    selected: Date | null
    onChange: (date: Date | null) => void
    placeholder?: string
    label?: string
    className?: string
    dateFormat?: string
    disabled?: boolean
    fullWidth?: boolean
}

// MUI TextField as Custom Input
const CustomInput = forwardRef<HTMLDivElement, any>(({ value, onClick, label, placeholder, disabled, fullWidth = true }, ref) => (
    <TextField
        ref={ref}
        value={value}
        onClick={disabled ? undefined : onClick}
        label={label}
        placeholder={placeholder}
        disabled={disabled}
        fullWidth={fullWidth}
        size="small"
        autoComplete="off"
        inputProps={{
            readOnly: true,
            inputMode: 'none',
            style: { cursor: disabled ? 'not-allowed' : 'pointer' }
        }}
        InputProps={{
            startAdornment: (
                <InputAdornment position="start">
                    <CalendarMonthIcon fontSize="small" color={disabled ? "disabled" : "primary"} />
                </InputAdornment>
            ),
            sx: {
                borderRadius: 2,
                bgcolor: disabled ? 'action.disabledBackground' : 'background.paper',
            }
        }}
        sx={{
            '& .MuiInputBase-root': { cursor: disabled ? 'not-allowed' : 'pointer' },
        }}
    />
))

CustomInput.displayName = 'CustomInput'

const CustomDatePicker = ({
    selected,
    onChange,
    label,
    placeholder = 'Chọn ngày',
    dateFormat = 'dd/MM/yyyy',
    disabled = false,
    fullWidth = true
}: CustomDatePickerProps) => {
    const { isDark } = useThemeMode()
    const { language } = useTranslation()

    useEffect(() => {
        // Re-register locale when language changes
        if (language === 'vn') {
            registerLocale('vn', vi)
        } else {
            registerLocale('en', enUS)
        }
    }, [language])

    return (
        <Box sx={{ width: fullWidth ? '100%' : 'auto', position: 'relative' }}>
            <DatePicker
                selected={selected}
                onChange={onChange}
                dateFormat={dateFormat}
                locale={language}
                placeholderText={placeholder}
                calendarClassName={`custom-calendar ${isDark ? 'dark-theme' : ''}`}
                showPopperArrow={false}
                todayButton={language === 'vn' ? 'Hôm nay' : 'Today'}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                popperPlacement="bottom-start"
                portalId="root"
                customInput={<CustomInput label={label} placeholder={placeholder} disabled={disabled} fullWidth={fullWidth} />}
                disabled={disabled}
            />
        </Box>
    )
}

export default CustomDatePicker
