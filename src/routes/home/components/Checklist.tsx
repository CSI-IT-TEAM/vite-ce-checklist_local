import './Checklist.css'

import { useNavigate } from 'react-router-dom'
import './Checklist.css'
import { useTranslation } from '../../../contexts/LanguageContext'

const Checklist = () => {
    const navigate = useNavigate()
    const { t } = useTranslation()

    const handleNavigation = (path: string) => {
        navigate(path)
    }

    return (
        <div className="checklist-container">
            <div className="checklist-header">
                <h1>{t('home.title')}</h1>
                <p>{t('home.subtitle')}</p>
            </div>

            <div className="checklist-grid">
                {/* Card 1 */}
                <div
                    className="checklist-card"
                    onClick={() => handleNavigation('/temperature')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="card-icon">🌡️</div>
                    <h3>{t('home.tempCardTitle')}</h3>
                    <p>{t('home.tempCardDesc')}</p>
                    <button
                        className="card-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNavigation('/temperature');
                        }}
                    >
                        {t('home.tempCardBtn')}
                    </button>
                </div>

                {/* Card 2 */}
                <div
                    className="checklist-card"
                    onClick={() => handleNavigation('/history')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="card-icon">📜</div>
                    <h3>{t('home.historyCardTitle')}</h3>
                    <p>{t('home.historyCardDesc')}</p>
                    <button
                        className="card-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNavigation('/history');
                        }}
                    >
                        {t('home.historyCardBtn')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Checklist
