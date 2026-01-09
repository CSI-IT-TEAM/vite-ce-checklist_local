import { useState, useEffect } from 'react'
import './RemarkPopup.css'
import { useTranslation } from '../../contexts/LanguageContext'

interface RemarkPopupProps {
    isOpen: boolean
    onClose: () => void
    onSave: (remark: string) => void
    initialRemark?: string
}

const RemarkPopup = ({ isOpen, onClose, onSave, initialRemark = '' }: RemarkPopupProps) => {
    const { t } = useTranslation()
    const [remark, setRemark] = useState(initialRemark)

    // Update remark when initialRemark changes (popup opens with new data)
    useEffect(() => {
        setRemark(initialRemark)
    }, [initialRemark])

    if (!isOpen) return null

    const handleSave = () => {
        onSave(remark)
        setRemark('')
    }

    const handleClose = () => {
        onClose()
        setRemark('')
    }

    return (
        <div className="remark-popup-overlay" onClick={handleClose}>
            <div className="remark-popup-content" onClick={(e) => e.stopPropagation()}>
                <div className="remark-popup-header">
                    <h2>{t('popup.remarkTitle') || 'Add Remark'}</h2>
                    <button className="remark-popup-close" onClick={handleClose}>×</button>
                </div>

                <p className="remark-popup-subtitle">
                    {t('popup.remarkSubtitle') || 'Enter your remark below. Click "Save" when done.'}
                </p>

                <div className="remark-popup-body">
                    <div className="remark-popup-form-group">
                        <label>
                            {t('common.remarks') || 'Remarks'}
                        </label>
                        <textarea
                            placeholder={t('popup.remarkPlaceholder') || 'Enter remark...'}
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            className="remark-popup-textarea"
                            rows={4}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="remark-popup-footer">
                    <button className="remark-popup-btn remark-popup-btn-save" onClick={handleSave}>
                        {t('popup.save')}
                    </button>
                    <button className="remark-popup-btn remark-popup-btn-cancel" onClick={handleClose}>
                        {t('popup.close')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RemarkPopup
