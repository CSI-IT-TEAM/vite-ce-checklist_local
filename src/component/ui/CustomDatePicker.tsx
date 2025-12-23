import DatePicker, { registerLocale } from 'react-datepicker'
import { vi, enUS } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'
import './CustomDatePicker.css'
import { useTranslation } from '../../contexts/LanguageContext'
import { useEffect, forwardRef } from 'react'

// Register locales
registerLocale('vn', vi)
registerLocale('en', enUS)

interface CustomDatePickerProps {
    selected: Date | null
    onChange: (date: Date | null) => void
    placeholder?: string
    className?: string
    dateFormat?: string
    disabled?: boolean
}

// Custom input component to prevent keyboard on mobile
const CustomInput = forwardRef<HTMLInputElement, any>(({ value, onClick, placeholder, disabled }, ref) => (
    <input
        type="text"
        value={value}
        onClick={disabled ? undefined : onClick}
        placeholder={placeholder}
        ref={ref}
        readOnly
        inputMode="none"
        className={`custom-date-input ${disabled ? 'custom-date-input--disabled' : ''}`}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        disabled={disabled}
    />
))

CustomInput.displayName = 'CustomInput'

const CustomDatePicker = ({
    selected,
    onChange,
    placeholder = 'Chọn ngày',
    dateFormat = 'dd/MM/yyyy',
    disabled = false
}: CustomDatePickerProps) => {
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
        <DatePicker
            selected={selected}
            onChange={onChange}
            dateFormat={dateFormat}
            locale={language}
            placeholderText={placeholder}
            calendarClassName="custom-calendar"
            showPopperArrow={false}
            todayButton={language === 'vn' ? 'Hôm nay' : 'Today'}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            popperPlacement="bottom-start"
            customInput={<CustomInput placeholder={placeholder} disabled={disabled} />}
            disabled={disabled}
        />
    )
}

export default CustomDatePicker
