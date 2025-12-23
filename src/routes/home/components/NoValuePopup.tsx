import { useState } from 'react'
import './NoValuePopup.css'
import { useTranslation } from '../../../contexts/LanguageContext'

interface NoValuePopupProps {
    isOpen: boolean
    onClose: () => void
    onSave: (temperature: string, remark: string) => void
    initialTemperature?: string
    initialRemark?: string
}

const NoValuePopup = ({ isOpen, onClose, onSave, initialTemperature = '', initialRemark = '' }: NoValuePopupProps) => {
    const { t } = useTranslation()
    const [temperature, setTemperature] = useState(initialTemperature)
    const [remark, setRemark] = useState(initialRemark)

    if (!isOpen) return null

    const handleSave = () => {
        onSave(temperature, remark)
        setTemperature('')
        setRemark('')
    }

    const handleClose = () => {
        onClose()
        setTemperature('')
        setRemark('')
    }

    const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        // Only allow numbers and decimal point
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setTemperature(value)
        }
    }

    return (
        <div className="no-popup-overlay" onClick={handleClose}>
            <div className="no-popup-content" onClick={(e) => e.stopPropagation()}>
                <div className="no-popup-header">
                    <h2>{t('popup.editTitle')}</h2>
                    <button className="no-popup-close" onClick={handleClose}>×</button>
                </div>

                <p className="no-popup-subtitle">
                    {t('popup.editSubtitle')}
                </p>

                <div className="no-popup-body">
                    <div className="no-popup-form-group">
                        <label>{t('popup.temperatureLabel')}</label>
                        <input
                            type="text"
                            placeholder={t('popup.temperaturePlaceholder')}
                            value={temperature}
                            onChange={handleTemperatureChange}
                            className="no-popup-input"
                        />
                    </div>

                    <div className="no-popup-form-group">
                        <label>
                            {t('popup.issueLabel')} <span className="required">(*)</span>
                        </label>
                        <textarea
                            placeholder={t('popup.issuePlaceholder')}
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            className="no-popup-textarea"
                            rows={4}
                        />
                    </div>
                </div>

                <div className="no-popup-footer">
                    <button className="no-popup-btn no-popup-btn-save" onClick={handleSave}>
                        {t('popup.save')}
                    </button>
                    <button className="no-popup-btn no-popup-btn-cancel" onClick={handleClose}>
                        {t('popup.close')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default NoValuePopup
