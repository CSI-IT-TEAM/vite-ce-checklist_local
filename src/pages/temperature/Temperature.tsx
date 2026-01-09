import React, { useState, useEffect } from 'react'
import './Temperature.css'
import { QrCode } from 'lucide-react'
import { getComboData, saveChecklistData } from '../../api'
import CameraScan from '../../components/camera/CameraScan'
import RemarkPopup from '../../components/common/RemarkPopup'
import { isNullOrEmpty } from '../../utils/is-empty'
import { useTranslation } from '../../contexts/LanguageContext'
import CustomDatePicker from '../../components/common/CustomDatePicker'

interface CheckPosition {
    settingValue: string
    displayValue: string
    value: string
    remark: string
}

interface CheckItem {
    id: number
    name: string
    standard: string
    left: CheckPosition
    right: CheckPosition
}

interface UserData {
    user?: Array<{
        EMP_NAME?: string
        empid?: string
        DEPT_NM?: string
    }>
}

interface TemperatureProps {
    userData?: UserData
}

const Temperature = ({ userData: propUserData }: TemperatureProps) => {
    // Auto-fill from userData
    const userData = propUserData || JSON.parse(localStorage.getItem('userData') || '{}')
    // Support cả cấu trúc mới (LoginLocal) và cũ (Login)
    const userInfo = userData?.user?.[0] || userData
    const { t } = useTranslation()

    const [openCamera, setOpenCamera] = useState(false);
    const [cameraKey, setCameraKey] = useState(0);
    const [showRemarkPopup, setShowRemarkPopup] = useState(false);
    const [currentEditItem, setCurrentEditItem] = useState<{ id: number; position: 'left' | 'right' } | null>(null);
    const [tempRemarkValue, setTempRemarkValue] = useState('');

    // const [factory, setFactory] = useState('Vĩnh Cửu')
    // const [location, setLocation] = useState('')
    // Đọc đúng key từ userData (LoginLocal format)
    // Ưu tiên nameEng vì userName bị lỗi VNI encoding
    const department = userInfo?.deptName || userInfo?.DEPT_NM || ''
    const departmentId = userInfo?.dept || userInfo?.DEPT_CD || ''
    const cardNumber = userInfo?.userID || userInfo?.empid || userInfo?.EMP_ID || ''
    const inspectorName = userInfo?.nameEng || userInfo?.userName || userInfo?.EMP_NAME || ''


    // const {
    //     isScanning,
    //     decodedText,
    //     openCamera,
    //     setDecodedText
    // } = useQrScannerStore();

    const [area, setArea] = useState('')
    const [plant, setPlant] = useState('')
    const [line, setLine] = useState('')
    const [process, setProcess] = useState('')
    const [machine, setMachine] = useState('')

    const [inspectionDate, setInspectionDate] = useState<Date | null>(new Date())
    // const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

    const [areaList, setAreaList] = useState<any[]>([])
    const [plantList, setPlantList] = useState<any[]>([])
    const [lineList, setLineList] = useState<any[]>([])
    const [processList, setProcessList] = useState<any[]>([])
    const [machineList, setMachineList] = useState<any[]>([])

    // State cho hộp thoại thông báo (thay thế cho alert/toast mặc định)
    const [notificationDialog, setNotificationDialog] = useState<{
        open: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({ open: false, type: 'success', title: '', message: '' });



    // Fetch Area on mount
    useEffect(() => {
        const fetchAreaList = async () => {
            try {
                const result = await getComboData('CBO_FAC');
                if (result?.success && result?.data?.OUT_CURSOR) {
                    setAreaList(result.data.OUT_CURSOR.filter((item: any) => item.NAME !== 'All' && item.CODE !== 'ALL'));
                }
            } catch (err) {
                console.error("Error fetching area:", err);
            }
        };
        fetchAreaList();
        setOpenCamera(false);
    }, [])





    const handleAreaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedArea = e.target.value
        setArea(selectedArea)
        setPlant('')
        setLine('')
        setProcess('')
        setMachine('')

        setPlantList([])
        setLineList([])
        setProcessList([])
        setMachineList([])

        if (selectedArea) {
            try {
                const result = await getComboData('CBO_PLANT', { condition1: selectedArea });
                if (result?.success && result?.data?.OUT_CURSOR) {
                    setPlantList(result.data.OUT_CURSOR.filter((item: any) => item.NAME !== 'All' && item.CODE !== 'ALL'));
                }
            } catch (err) {
                console.error("Error fetching plant:", err);
            }
        }
    }

    const handlePlantChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPlant = e.target.value
        setPlant(selectedPlant)
        setLine('')
        setProcess('')
        setMachine('')
        setLineList([])
        setProcessList([])
        setMachineList([])

        if (selectedPlant) {
            try {
                const result = await getComboData('CBO_LINE', {
                    condition1: area,
                    condition2: selectedPlant
                });
                if (result?.success && result?.data?.OUT_CURSOR) {
                    setLineList(result.data.OUT_CURSOR.filter((item: any) => item.NAME !== 'All' && item.CODE !== 'ALL'));
                }
            } catch (err) {
                console.error("Error fetching line:", err);
            }
        }
    }

    const handleLineChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLine = e.target.value
        setLine(selectedLine)
        setProcess('')
        setMachine('')
        setProcessList([])
        setMachineList([])

        if (selectedLine) {
            try {
                const result = await getComboData('CBO_PROCESS', {
                    condition1: area,
                    condition2: plant,
                    condition3: selectedLine
                });
                if (result?.success && result?.data?.OUT_CURSOR) {
                    setProcessList(result.data.OUT_CURSOR.filter((item: any) => item.NAME !== 'All' && item.CODE !== 'ALL'));
                }
            } catch (err) {
                console.error("Error fetching process:", err);
            }
        }
    }

    const handleProcessChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedProcess = e.target.value
        setProcess(selectedProcess)
        setMachine('')
        setMachineList([])

        if (selectedProcess) {
            try {
                const result = await getComboData('CBO_MACHINE', {
                    condition1: area,
                    condition2: plant,
                    condition3: line,
                    condition4: selectedProcess
                });
                if (result?.success && result?.data?.OUT_CURSOR) {
                    setMachineList(result.data.OUT_CURSOR.filter((item: any) => item.NAME !== 'All' && item.CODE !== 'ALL'));
                }
            } catch (err) {
                console.error("Error fetching machine:", err);
            }
        }
    }

    const handleMachineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedMachine = e.target.value
        setMachine(selectedMachine)

        // Find the selected machine in machineList to get setting values
        const machineData = machineList.find((item: any) =>
            (item.CODE || item.NAME) === selectedMachine
        )

        if (machineData) {
            // Update checkItems with setting and display values from machine data
            setCheckItems(items => items.map(item => {
                let leftSetting = '';
                let rightSetting = '';
                let leftDisplay = '';
                let rightDisplay = '';

                if (item.id === 1) {
                    // Lower
                    leftSetting = machineData.LOWER_SETTING_L != null ? String(machineData.LOWER_SETTING_L) : '';
                    rightSetting = machineData.LOWER_SETTING_R != null ? String(machineData.LOWER_SETTING_R) : '';
                    leftDisplay = machineData.LOWER_DISPLAY_L != null ? String(machineData.LOWER_DISPLAY_L) : '';
                    rightDisplay = machineData.LOWER_DISPLAY_R != null ? String(machineData.LOWER_DISPLAY_R) : '';
                } else if (item.id === 2) {
                    // Middle
                    leftSetting = machineData.MIDDLE_SETTING_L != null ? String(machineData.MIDDLE_SETTING_L) : '';
                    rightSetting = machineData.MIDDLE_SETTING_R != null ? String(machineData.MIDDLE_SETTING_R) : '';
                    leftDisplay = machineData.MIDDLE_DISPLAY_L != null ? String(machineData.MIDDLE_DISPLAY_L) : '';
                    rightDisplay = machineData.MIDDLE_DISPLAY_R != null ? String(machineData.MIDDLE_DISPLAY_R) : '';
                } else if (item.id === 3) {
                    // Upper
                    leftSetting = machineData.UPPER_SETTING_L != null ? String(machineData.UPPER_SETTING_L) : '';
                    rightSetting = machineData.UPPER_SETTING_R != null ? String(machineData.UPPER_SETTING_R) : '';
                    leftDisplay = machineData.UPPER_DISPLAY_L != null ? String(machineData.UPPER_DISPLAY_L) : '';
                    rightDisplay = machineData.UPPER_DISPLAY_R != null ? String(machineData.UPPER_DISPLAY_R) : '';
                }

                return {
                    ...item,
                    left: {
                        ...item.left,
                        settingValue: leftSetting,
                        displayValue: leftDisplay
                    },
                    right: {
                        ...item.right,
                        settingValue: rightSetting,
                        displayValue: rightDisplay
                    }
                };
            }));
        } else {
            // Reset values if no machine selected
            setCheckItems(items => items.map(item => ({
                ...item,
                left: { ...item.left, settingValue: '', displayValue: '' },
                right: { ...item.right, settingValue: '', displayValue: '' }
            })));
        }
    }

    const createInitialPosition = () => ({ settingValue: '', displayValue: '', value: '', remark: '' })

    const [checkItems, setCheckItems] = useState<CheckItem[]>([
        {
            id: 1,
            name: 'temperature.item1',
            standard: 'temperature.standard1',
            left: createInitialPosition(),
            right: createInitialPosition()
        },
        {
            id: 2,
            name: 'temperature.item2',
            standard: 'temperature.standard2',
            left: createInitialPosition(),
            right: createInitialPosition()
        },
        {
            id: 3,
            name: 'temperature.item3',
            standard: 'temperature.standard3',
            left: createInitialPosition(),
            right: createInitialPosition()
        },
    ])

    const handleSettingValueChange = (id: number, position: 'left' | 'right', value: string) => {
        if (value !== '' && !/^\d*\.?\d*$/.test(value)) return

        setCheckItems(items =>
            items.map(item => {
                if (item.id !== id) return item;
                return {
                    ...item,
                    [position]: {
                        ...item[position],
                        settingValue: value
                    }
                }
            })
        )
    }

    const handleDisplayValueChange = (id: number, position: 'left' | 'right', value: string) => {
        if (value !== '' && !/^\d*\.?\d*$/.test(value)) return

        setCheckItems(items =>
            items.map(item => {
                if (item.id !== id) return item;
                return {
                    ...item,
                    [position]: {
                        ...item[position],
                        displayValue: value
                    }
                }
            })
        )
    }

    const handleValueChange = (id: number, position: 'left' | 'right', value: string) => {
        if (value !== '' && !/^\d*\.?\d*$/.test(value)) return

        setCheckItems(items =>
            items.map(item => {
                if (item.id !== id) return item;
                return {
                    ...item,
                    [position]: {
                        ...item[position],
                        value: value
                    }
                }
            })
        )
    }

    // const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     if (e.target.files) {
    //         setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)])
    //     }
    // }

    // Handle click on Remarks cell to open popup
    const handleRemarkClick = (id: number, position: 'left' | 'right') => {
        const item = checkItems.find(item => item.id === id);
        if (item) {
            setCurrentEditItem({ id, position });
            setTempRemarkValue(item[position].remark);
            setShowRemarkPopup(true);
        }
    };

    const handleSaveRemark = (remark: string) => {
        if (currentEditItem) {
            setCheckItems(items =>
                items.map(item => {
                    if (item.id !== currentEditItem.id) return item;
                    return {
                        ...item,
                        [currentEditItem.position]: {
                            ...item[currentEditItem.position],
                            remark: remark
                        }
                    }
                })
            );
            setShowRemarkPopup(false);
            setCurrentEditItem(null);
            setTempRemarkValue('');
        }
    };

    const handleCloseRemarkPopup = () => {
        setShowRemarkPopup(false);
        setCurrentEditItem(null);
        setTempRemarkValue('');
    };

    const resetForm = () => {
        // Reset tất cả combo boxes về trạng thái ban đầu
        setArea('')
        setPlant('')
        setLine('')
        setProcess('')
        setMachine('')

        // Reset các danh sách combo (giữ lại areaList vì đã load từ đầu)
        setPlantList([])
        setLineList([])
        setProcessList([])
        setMachineList([])

        // Reset các ô nhập liệu
        setCheckItems(items => items.map(item => ({
            ...item,
            left: createInitialPosition(),
            right: createInitialPosition()
        })));
    }

    const showNotification = (type: 'success' | 'error', title: string, message: string) => {
        setNotificationDialog({ open: true, type, title, message });

        // Auto-close success notifications after 2 seconds
        if (type === 'success') {
            setTimeout(() => {
                setNotificationDialog(prev => ({ ...prev, open: false }));
            }, 2000);
        }
    };

    const handleSubmit = async () => {
        if (!machine) {
            showNotification('error', t('notification.error'), t('notification.selectMachine'))
            return
        }

        // Validate: All three (Setting, Display, Value) must either all have values or all be empty
        // TEMPORARILY DISABLED - uncomment after testing
        // const validationErrors: string[] = []
        // checkItems.forEach(item => { ... })

        // if (validationErrors.length > 0) {
        //     console.log('Validation Errors:', validationErrors)
        //     alert removed
        //     showNotification('error', t('notification.error'), t('notification.enterTemperature'))
        //     return
        // }

        const promises: Promise<any>[] = []

        checkItems.forEach(item => {
            const processPosition = (position: 'left' | 'right', posData: CheckPosition) => {
                // Save only if all three (Setting, Display, Value) have values
                const hasSetting = posData.settingValue.trim() !== ''
                const hasDisplay = posData.displayValue.trim() !== ''
                const hasValue = posData.value.trim() !== ''

                if (hasSetting && hasDisplay && hasValue) {
                    promises.push(saveChecklistData({
                        qtype: 'SAVE',
                        barcode: machine,
                        empId: cardNumber,
                        empName: inspectorName,
                        deptId: departmentId,
                        deptName: department,
                        locate: item.id === 1 ? "LOWER" : item.id === 2 ? "MIDDLE" : "UPPER",
                        div: position === 'left' ? 'L' : 'R',
                        checkStatus: 'OK',
                        checkValues: posData.value,
                        remarks: posData.remark || '',
                        settingValues: posData.settingValue,
                        displayValues: posData.displayValue
                    }))
                }
            }

            processPosition('left', item.left)
            processPosition('right', item.right)
        })

        if (promises.length === 0) {
            showNotification('error', t('notification.error'), t('notification.checkAtLeastOne'))
            return
        }

        try {
            const results = await Promise.all(promises)
            // Check if all saves were successful
            const allSuccess = results.every(r => r.success)
            if (allSuccess) {
                showNotification('success', t('notification.success'), t('notification.saveSuccess'))
                resetForm()
            } else {
                const failedCount = results.filter(r => !r.success).length
                showNotification('error', t('notification.error'), `${failedCount} items failed to save`)
            }
        } catch (error) {
            console.error("Lỗi khi lưu dữ liệu:", error)
            showNotification('error', t('notification.error'), t('notification.saveError'))
        }
    }

    const handleCloseCamera = () => {
        setOpenCamera(false);
        // Increment key to ensure fresh instance on next open
        setCameraKey(prev => prev + 1);
    }

    const handleScanSuccess = async (decodedText: any) => {
        if (!isNullOrEmpty(decodedText)) {
            setOpenCamera(false);

            try {
                const qrResult = await getComboData('QR_INFOR', { condition1: decodedText });

                if (qrResult?.success && qrResult?.data?.OUT_CURSOR && qrResult.data.OUT_CURSOR.length > 0) {
                    const info = qrResult.data.OUT_CURSOR[0];
                    console.log('QR Data:', qrResult);
                    // Set values
                    setArea(info.FAC_CD);
                    setPlant(info.PLANT_CD);
                    setLine(info.LINE_CD);
                    setProcess(info.LOC_CD);
                    setMachine(info.MC_CODE);

                    // Set setting and display values from QR data
                    setCheckItems(items => items.map(item => {
                        let leftSetting = '';
                        let rightSetting = '';
                        let leftDisplay = '';
                        let rightDisplay = '';

                        if (item.id === 1) {
                            // Lower
                            leftSetting = info.LOWER_SETTING_L != null ? String(info.LOWER_SETTING_L) : '';
                            rightSetting = info.LOWER_SETTING_R != null ? String(info.LOWER_SETTING_R) : '';
                            leftDisplay = info.LOWER_DISPLAY_L != null ? String(info.LOWER_DISPLAY_L) : '';
                            rightDisplay = info.LOWER_DISPLAY_R != null ? String(info.LOWER_DISPLAY_R) : '';
                        } else if (item.id === 2) {
                            // Middle
                            leftSetting = info.MIDDLE_SETTING_L != null ? String(info.MIDDLE_SETTING_L) : '';
                            rightSetting = info.MIDDLE_SETTING_R != null ? String(info.MIDDLE_SETTING_R) : '';
                            leftDisplay = info.MIDDLE_DISPLAY_L != null ? String(info.MIDDLE_DISPLAY_L) : '';
                            rightDisplay = info.MIDDLE_DISPLAY_R != null ? String(info.MIDDLE_DISPLAY_R) : '';
                        } else if (item.id === 3) {
                            // Upper
                            leftSetting = info.UPPER_SETTING_L != null ? String(info.UPPER_SETTING_L) : '';
                            rightSetting = info.UPPER_SETTING_R != null ? String(info.UPPER_SETTING_R) : '';
                            leftDisplay = info.UPPER_DISPLAY_L != null ? String(info.UPPER_DISPLAY_L) : '';
                            rightDisplay = info.UPPER_DISPLAY_R != null ? String(info.UPPER_DISPLAY_R) : '';
                        }

                        return {
                            ...item,
                            left: {
                                ...item.left,
                                settingValue: leftSetting,
                                displayValue: leftDisplay
                            },
                            right: {
                                ...item.right,
                                settingValue: rightSetting,
                                displayValue: rightDisplay
                            }
                        };
                    }));

                    // Fetch full lists concurrently
                    try {
                        const [plantRes, lineRes, processRes, machineRes] = await Promise.all([
                            getComboData('CBO_PLANT', { condition1: info.FAC_CD }),
                            getComboData('CBO_LINE', { condition1: info.FAC_CD, condition2: info.PLANT_CD }),
                            getComboData('CBO_PROCESS', { condition1: info.FAC_CD, condition2: info.PLANT_CD, condition3: info.LINE_CD }),
                            getComboData('CBO_MACHINE', { condition1: info.FAC_CD, condition2: info.PLANT_CD, condition3: info.LINE_CD, condition4: info.LOC_CD })
                        ]);

                        if (plantRes?.success && plantRes?.data?.OUT_CURSOR) {
                            setPlantList(plantRes.data.OUT_CURSOR.filter((item: any) => item.NAME !== 'All' && item.CODE !== 'All'));
                        }
                        if (lineRes?.success && lineRes?.data?.OUT_CURSOR) {
                            setLineList(lineRes.data.OUT_CURSOR.filter((item: any) => item.NAME !== 'All' && item.CODE !== 'All'));
                        }
                        if (processRes?.success && processRes?.data?.OUT_CURSOR) {
                            setProcessList(processRes.data.OUT_CURSOR.filter((item: any) => item.NAME !== 'All' && item.CODE !== 'All'));
                        }
                        if (machineRes?.success && machineRes?.data?.OUT_CURSOR) {
                            setMachineList(machineRes.data.OUT_CURSOR.filter((item: any) => item.NAME !== 'All' && item.CODE !== 'All'));
                        }

                    } catch (err) {
                        console.error("Error fetching combo lists:", err);
                    }

                } else {
                    showNotification('error', t('notification.error'), t('notification.deviceNotFound'));
                }
            } catch (err) {
                console.error("Error fetching QR info:", err);
                showNotification('error', t('notification.error'), t('notification.deviceError'));
            }
        }
    }

    return (
        <div className="temperature-container">
            <div className="temperature-header">
                <h1>{t('temperature.title')}</h1>
                <p>{t('temperature.subtitle')}</p>
            </div>

            <div className="temperature-content">
                {/* Left Column - Personal Info */}
                {/* <div className="info-section">
                    <h3>{t('temperature.personalInfo')}</h3>
                    <div className="form-group">
                        <label>{t('temperature.department')}</label>
                        <input
                            type="text"
                            value={department}
                            disabled
                            className="bg-gray-100 cursor-not-allowed"
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('temperature.idCard')}</label>
                        <input
                            type="text"
                            value={cardNumber}
                            disabled
                            className="bg-gray-100 cursor-not-allowed"
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('temperature.fullName')}</label>
                        <input
                            type="text"
                            value={inspectorName}
                            disabled
                            className="bg-gray-100 cursor-not-allowed"
                        />
                    </div>
                </div> */}

                {/* Middle Column - Inspection Info */}
                <div className="inspection-section">
                    <h3>{t('temperature.inspectionInfo')}</h3>

                    <div className="form-group">
                        <label>{t('temperature.area')} <span className="required"></span></label>
                        <select value={area} onChange={handleAreaChange} disabled>
                            <option value="" hidden>{t('common.select')}</option>
                            {areaList.length === 0 ? (
                                <option value="" disabled>No options</option>
                            ) : (
                                areaList.map((item, index) => (
                                    <option key={index} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{t('temperature.plant')} <span className="required"></span></label>
                        <select value={plant} onChange={handlePlantChange} disabled>
                            <option value="" hidden>{t('common.select')}</option>
                            {plantList.length === 0 ? (
                                <option value="" disabled>No options</option>
                            ) : (
                                plantList.map((item, index) => (
                                    <option key={index} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{t('temperature.line')} <span className="required"></span></label>
                        <select value={line} onChange={handleLineChange} disabled>
                            <option value="" hidden>{t('common.select')}</option>
                            {lineList.length === 0 ? (
                                <option value="" disabled>No options</option>
                            ) : (
                                lineList.map((item, index) => (
                                    <option key={index} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{t('temperature.process')} <span className="required"></span></label>
                        <select value={process} onChange={handleProcessChange} disabled>
                            <option value="" hidden>{t('common.select')}</option>
                            {processList.length === 0 ? (
                                <option value="" disabled>No options</option>
                            ) : (
                                processList.map((item, index) => (
                                    <option key={index} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{t('temperature.machine')} <span className="required"></span></label>
                        <select value={machine} onChange={handleMachineChange} disabled>
                            <option value="" hidden>{t('common.select')}</option>
                            {machineList.length === 0 ? (
                                <option value="" disabled>No options</option>
                            ) : (
                                machineList.map((item, index) => (
                                    <option key={index} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{t('temperature.checkDate')} <span className="required"></span></label>
                        <CustomDatePicker
                            selected={inspectionDate}
                            onChange={(date) => setInspectionDate(date)}
                            placeholder={t('common.select')}
                            disabled
                        />
                    </div>

                    {/* <div className="form-group">
                        <label>Giờ Bắt Đầu <span className="required">(*)</span></label>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            placeholder="09:50 AM"
                        />
                    </div>

                    <div className="form-group">
                        <label>Giờ Kết Thúc <span className="required">(*)</span></label>
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            placeholder="09:50 AM"
                        />
                    </div> */}

                    {/* <div className="upload-section">
                        <div className="upload-notice">
                            <span>ℹ️</span> Vui lòng chọn các tập có định dạng được tải lên: jpeg, png
                        </div>
                        <div className="upload-zone">
                            <input
                                type="file"
                                multiple
                                accept="image/jpeg,image/png"
                                onChange={handleFileUpload}
                                id="file-upload"
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="file-upload" className="upload-label">
                                <div className="upload-icon">☁️</div>
                                <div>Click here to upload files</div>
                            </label>
                        </div>
                    </div> */}
                </div>

                {/* Right Column - Checklist */}
                <div className="checklist-section">

                    <div className="checklist-table-wrapper">
                        <table className="checklist-table">
                            <thead>
                                <tr>
                                    <th className="col-category">{t('temperature.category')}</th>
                                    <th className="col-position">{t('temperature.position')}</th>
                                    <th className="col-value">{t('common.setting') || 'Setting'}</th>
                                    <th className="col-value">{t('common.display') || 'Display'}</th>
                                    <th className="col-value">{t('common.value')}</th>
                                    <th className="col-remarks">{t('common.remarks') || 'Remarks'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {checkItems
                                    .filter(item => {
                                        // Kiểm tra process có phải FGA không (case-insensitive, startsWith)
                                        const isFGA = process?.toUpperCase()?.startsWith('FGA');
                                        return !(isFGA && item.id === 2); // Ẩn Giữa khi process là FGA
                                    })
                                    .map((item) => {
                                        // Kiểm tra process có phải FGA không
                                        const isFGA = process?.toUpperCase()?.startsWith('FGA');

                                        // Tính suffix cho tên item dựa vào process
                                        const getItemSuffix = () => {
                                            if (!isFGA) return ''; // Không hiển thị suffix khi process khác FGA
                                            if (item.id === 1) return ' (Upper)';
                                            if (item.id === 3) return ' (F/S)';
                                            return '';
                                        };

                                        return (
                                            <React.Fragment key={item.id}>
                                                {/* Row 1: Left */}
                                                <tr key={`${item.id}-left`}>
                                                    <td rowSpan={2} className="item-content">
                                                        <div className="item-name">{t(item.name)}{getItemSuffix()}</div>
                                                        {/* {item.standard && (
                                                    <div className="item-standard">{t(item.standard)}</div>
                                                )} */}
                                                    </td>
                                                    <td className="position-cell">{t('temperature.left')}</td>
                                                    <td className="value-cell">
                                                        <input
                                                            type="number"
                                                            className="value-input"
                                                            value={item.left.settingValue}
                                                            onChange={(e) => handleSettingValueChange(item.id, 'left', e.target.value)}
                                                            placeholder=""
                                                        />
                                                    </td>
                                                    <td className="value-cell">
                                                        <input
                                                            type="number"
                                                            className="value-input"
                                                            value={item.left.displayValue}
                                                            onChange={(e) => handleDisplayValueChange(item.id, 'left', e.target.value)}
                                                            placeholder=""
                                                        />
                                                    </td>
                                                    <td className="value-cell">
                                                        <input
                                                            type="number"
                                                            className="value-input"
                                                            value={item.left.value}
                                                            onChange={(e) => handleValueChange(item.id, 'left', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="remarks-cell" onClick={() => handleRemarkClick(item.id, 'left')}>
                                                        <div className="remarks-content">
                                                            {item.left.remark || <span className="remarks-placeholder">Click to add</span>}
                                                        </div>
                                                    </td>
                                                </tr>
                                                {/* Row 2: Right */}
                                                <tr key={`${item.id}-right`}>
                                                    <td className="position-cell">{t('temperature.right')}</td>
                                                    <td className="value-cell">
                                                        <input
                                                            type="number"
                                                            className="value-input"
                                                            value={item.right.settingValue}
                                                            onChange={(e) => handleSettingValueChange(item.id, 'right', e.target.value)}
                                                            placeholder=""
                                                        />
                                                    </td>
                                                    <td className="value-cell">
                                                        <input
                                                            type="number"
                                                            className="value-input"
                                                            value={item.right.displayValue}
                                                            onChange={(e) => handleDisplayValueChange(item.id, 'right', e.target.value)}
                                                            placeholder=""
                                                        />
                                                    </td>
                                                    <td className="value-cell">
                                                        <input
                                                            type="number"
                                                            className="value-input"
                                                            value={item.right.value}
                                                            onChange={(e) => handleValueChange(item.id, 'right', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="remarks-cell" onClick={() => handleRemarkClick(item.id, 'right')}>
                                                        <div className="remarks-content">
                                                            {item.right.remark || <span className="remarks-placeholder">Click to add</span>}
                                                        </div>
                                                    </td>
                                                </tr>

                                            </React.Fragment>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="temperature-actions">
                <button className="btn-cancel" onClick={resetForm}>{t('common.cancel')}</button>
                <button className="btn-submit" onClick={handleSubmit}>{t('common.submit')}</button>
            </div>

            {/* Floating QR Button */}
            <button
                className="floating-qr-button"
                onClick={() => {
                    setCameraKey(prev => prev + 1);
                    setOpenCamera(true);
                }}
                title={t('temperature.scanQR') || 'Scan QR'}
            >
                <QrCode size={28} />
            </button>

            {/* QR Scanner Dialog */}
            {openCamera &&
                <CameraScan key={cameraKey} open={openCamera} handleSuccess={handleScanSuccess} handleClose={handleCloseCamera} />
            }

            {/* Remark Popup */}
            <RemarkPopup
                isOpen={showRemarkPopup}
                onClose={handleCloseRemarkPopup}
                onSave={handleSaveRemark}
                initialRemark={tempRemarkValue}
            />

            {/* Notification Dialog */}
            {notificationDialog.open && (
                <div className="notification-overlay" onClick={() => setNotificationDialog({ ...notificationDialog, open: false })}>
                    <div className={`notification-dialog notification-${notificationDialog.type}`} onClick={(e) => e.stopPropagation()}>
                        <div className="notification-header">
                            <h3>{notificationDialog.title}</h3>
                            <button className="notification-close" onClick={() => setNotificationDialog({ ...notificationDialog, open: false })}>×</button>
                        </div>
                        <div className="notification-body">
                            <p>{notificationDialog.message}</p>
                        </div>
                        <div className="notification-footer">
                            <button
                                className={`notification-btn notification-btn-${notificationDialog.type}`}
                                onClick={() => setNotificationDialog({ ...notificationDialog, open: false })}
                            >
                                {t('common.ok')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    )
}

export default Temperature
