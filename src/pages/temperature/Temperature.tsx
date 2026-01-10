import React, { useState, useEffect } from 'react'
import { getComboData, saveChecklistData } from '../../api'
import CameraScan from '../../components/camera/CameraScan'
import RemarkPopup from '../../components/common/RemarkPopup'
import { isNullOrEmpty } from '../../utils/is-empty'
import { useTranslation } from '../../contexts/LanguageContext'
import { useThemeMode } from '../../contexts/ThemeContext'
import CustomDatePicker from '../../components/common/CustomDatePicker'
import {
    Box,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import SendIcon from '@mui/icons-material/Send'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import CloseIcon from '@mui/icons-material/Close'

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
    const userData = propUserData || JSON.parse(localStorage.getItem('userData') || '{}')
    const userInfo = userData?.user?.[0] || userData
    const { t } = useTranslation()
    const { isDark } = useThemeMode()

    const [openCamera, setOpenCamera] = useState(false)
    const [cameraKey, setCameraKey] = useState(0)
    const [showRemarkPopup, setShowRemarkPopup] = useState(false)
    const [currentEditItem, setCurrentEditItem] = useState<{ id: number; position: 'left' | 'right' } | null>(null)
    const [tempRemarkValue, setTempRemarkValue] = useState('')

    const department = userInfo?.deptName || userInfo?.DEPT_NM || ''
    const departmentId = userInfo?.dept || userInfo?.DEPT_CD || ''
    const cardNumber = userInfo?.userID || userInfo?.empid || userInfo?.EMP_ID || ''
    const inspectorName = userInfo?.nameEng || userInfo?.userName || userInfo?.EMP_NAME || ''

    const [area, setArea] = useState('')
    const [plant, setPlant] = useState('')
    const [line, setLine] = useState('')
    const [process, setProcess] = useState('')
    const [machine, setMachine] = useState('')

    const [inspectionDate, setInspectionDate] = useState<Date | null>(new Date())

    const [areaList, setAreaList] = useState<any[]>([])
    const [plantList, setPlantList] = useState<any[]>([])
    const [lineList, setLineList] = useState<any[]>([])
    const [processList, setProcessList] = useState<any[]>([])
    const [machineList, setMachineList] = useState<any[]>([])

    const [notificationDialog, setNotificationDialog] = useState<{
        open: boolean
        type: 'success' | 'error'
        title: string
        message: string
    }>({ open: false, type: 'success', title: '', message: '' })

    // Fetch Area on mount
    useEffect(() => {
        const fetchAreaList = async () => {
            try {
                const result = await getComboData('CBO_FAC')
                if (result?.success && result?.data?.OUT_CURSOR) {
                    setAreaList(result.data.OUT_CURSOR.filter((item: any) => item.NAME !== 'All' && item.CODE !== 'ALL'))
                }
            } catch (err) {
                console.error("Error fetching area:", err)
            }
        }
        fetchAreaList()
        setOpenCamera(false)
    }, [])

    const handleAreaChange = async (e: SelectChangeEvent<string>) => {
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
                const result = await getComboData('CBO_PLANT', { condition1: selectedArea })
                if (result?.success && result?.data?.OUT_CURSOR) {
                    setPlantList(result.data.OUT_CURSOR.filter((item: any) => item.NAME !== 'All' && item.CODE !== 'ALL'))
                }
            } catch (err) {
                console.error("Error fetching plant:", err)
            }
        }
    }

    const handlePlantChange = async (e: SelectChangeEvent<string>) => {
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
                })
                if (result?.success && result?.data?.OUT_CURSOR) {
                    setLineList(result.data.OUT_CURSOR.filter((item: any) => item.NAME !== 'All' && item.CODE !== 'ALL'))
                }
            } catch (err) {
                console.error("Error fetching line:", err)
            }
        }
    }

    const handleLineChange = async (e: SelectChangeEvent<string>) => {
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
                })
                if (result?.success && result?.data?.OUT_CURSOR) {
                    setProcessList(result.data.OUT_CURSOR.filter((item: any) => item.NAME !== 'All' && item.CODE !== 'ALL'))
                }
            } catch (err) {
                console.error("Error fetching process:", err)
            }
        }
    }

    const handleProcessChange = async (e: SelectChangeEvent<string>) => {
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
                })
                if (result?.success && result?.data?.OUT_CURSOR) {
                    setMachineList(result.data.OUT_CURSOR.filter((item: any) => item.NAME !== 'All' && item.CODE !== 'ALL'))
                }
            } catch (err) {
                console.error("Error fetching machine:", err)
            }
        }
    }

    const handleMachineChange = (e: SelectChangeEvent<string>) => {
        const selectedMachine = e.target.value
        setMachine(selectedMachine)

        const machineData = machineList.find((item: any) =>
            (item.CODE || item.NAME) === selectedMachine
        )

        if (machineData) {
            setCheckItems(items => items.map(item => {
                let leftSetting = ''
                let rightSetting = ''
                let leftDisplay = ''
                let rightDisplay = ''

                if (item.id === 1) {
                    leftSetting = machineData.LOWER_SETTING_L != null ? String(machineData.LOWER_SETTING_L) : ''
                    rightSetting = machineData.LOWER_SETTING_R != null ? String(machineData.LOWER_SETTING_R) : ''
                    leftDisplay = machineData.LOWER_DISPLAY_L != null ? String(machineData.LOWER_DISPLAY_L) : ''
                    rightDisplay = machineData.LOWER_DISPLAY_R != null ? String(machineData.LOWER_DISPLAY_R) : ''
                } else if (item.id === 2) {
                    leftSetting = machineData.MIDDLE_SETTING_L != null ? String(machineData.MIDDLE_SETTING_L) : ''
                    rightSetting = machineData.MIDDLE_SETTING_R != null ? String(machineData.MIDDLE_SETTING_R) : ''
                    leftDisplay = machineData.MIDDLE_DISPLAY_L != null ? String(machineData.MIDDLE_DISPLAY_L) : ''
                    rightDisplay = machineData.MIDDLE_DISPLAY_R != null ? String(machineData.MIDDLE_DISPLAY_R) : ''
                } else if (item.id === 3) {
                    leftSetting = machineData.UPPER_SETTING_L != null ? String(machineData.UPPER_SETTING_L) : ''
                    rightSetting = machineData.UPPER_SETTING_R != null ? String(machineData.UPPER_SETTING_R) : ''
                    leftDisplay = machineData.UPPER_DISPLAY_L != null ? String(machineData.UPPER_DISPLAY_L) : ''
                    rightDisplay = machineData.UPPER_DISPLAY_R != null ? String(machineData.UPPER_DISPLAY_R) : ''
                }

                return {
                    ...item,
                    left: { ...item.left, settingValue: leftSetting, displayValue: leftDisplay },
                    right: { ...item.right, settingValue: rightSetting, displayValue: rightDisplay }
                }
            }))
        } else {
            setCheckItems(items => items.map(item => ({
                ...item,
                left: { ...item.left, settingValue: '', displayValue: '' },
                right: { ...item.right, settingValue: '', displayValue: '' }
            })))
        }
    }

    const createInitialPosition = () => ({ settingValue: '', displayValue: '', value: '', remark: '' })

    const [checkItems, setCheckItems] = useState<CheckItem[]>([
        { id: 1, name: 'temperature.item1', standard: 'temperature.standard1', left: createInitialPosition(), right: createInitialPosition() },
        { id: 2, name: 'temperature.item2', standard: 'temperature.standard2', left: createInitialPosition(), right: createInitialPosition() },
        { id: 3, name: 'temperature.item3', standard: 'temperature.standard3', left: createInitialPosition(), right: createInitialPosition() },
    ])

    const handleSettingValueChange = (id: number, position: 'left' | 'right', value: string) => {
        if (value !== '' && !/^\d*\.?\d*$/.test(value)) return
        setCheckItems(items =>
            items.map(item => {
                if (item.id !== id) return item
                return { ...item, [position]: { ...item[position], settingValue: value } }
            })
        )
    }

    const handleDisplayValueChange = (id: number, position: 'left' | 'right', value: string) => {
        if (value !== '' && !/^\d*\.?\d*$/.test(value)) return
        setCheckItems(items =>
            items.map(item => {
                if (item.id !== id) return item
                return { ...item, [position]: { ...item[position], displayValue: value } }
            })
        )
    }

    const handleValueChange = (id: number, position: 'left' | 'right', value: string) => {
        if (value !== '' && !/^\d*\.?\d*$/.test(value)) return
        setCheckItems(items =>
            items.map(item => {
                if (item.id !== id) return item
                return { ...item, [position]: { ...item[position], value: value } }
            })
        )
    }

    const handleRemarkClick = (id: number, position: 'left' | 'right') => {
        const item = checkItems.find(item => item.id === id)
        if (item) {
            setCurrentEditItem({ id, position })
            setTempRemarkValue(item[position].remark)
            setShowRemarkPopup(true)
        }
    }

    const handleSaveRemark = (remark: string) => {
        if (currentEditItem) {
            setCheckItems(items =>
                items.map(item => {
                    if (item.id !== currentEditItem.id) return item
                    return { ...item, [currentEditItem.position]: { ...item[currentEditItem.position], remark: remark } }
                })
            )
            setShowRemarkPopup(false)
            setCurrentEditItem(null)
            setTempRemarkValue('')
        }
    }

    const handleCloseRemarkPopup = () => {
        setShowRemarkPopup(false)
        setCurrentEditItem(null)
        setTempRemarkValue('')
    }

    const resetForm = () => {
        setArea('')
        setPlant('')
        setLine('')
        setProcess('')
        setMachine('')
        setPlantList([])
        setLineList([])
        setProcessList([])
        setMachineList([])
        setCheckItems(items => items.map(item => ({
            ...item,
            left: createInitialPosition(),
            right: createInitialPosition()
        })))
    }

    const showNotification = (type: 'success' | 'error', title: string, message: string) => {
        setNotificationDialog({ open: true, type, title, message })
        if (type === 'success') {
            setTimeout(() => {
                setNotificationDialog(prev => ({ ...prev, open: false }))
            }, 2000)
        }
    }

    const handleSubmit = async () => {
        if (isNullOrEmpty(machine)) {
            showNotification('error', t('notification.error'), t('notification.selectMachine'))
            return
        }

        const promises: Promise<any>[] = []

        checkItems.forEach((item) => {
            const processPosition = (position: 'left' | 'right', posData: CheckPosition) => {
                const hasSetting = !isNullOrEmpty(posData.settingValue)
                const hasDisplay = !isNullOrEmpty(posData.displayValue)
                const hasValue = !isNullOrEmpty(posData.value)

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
        setOpenCamera(false)
        setCameraKey(prev => prev + 1)
    }

    const handleScanSuccess = async (decodedText: any) => {
        if (!isNullOrEmpty(decodedText)) {
            setOpenCamera(false)

            try {
                const qrResult = await getComboData('QR_INFOR', { condition1: decodedText })

                if (qrResult?.success && qrResult?.data?.OUT_CURSOR && qrResult.data.OUT_CURSOR.length > 0) {
                    const info = qrResult.data.OUT_CURSOR[0]
                    setArea(info.FAC_CD)
                    setPlant(info.PLANT_CD)
                    setLine(info.LINE_CD)
                    setProcess(info.LOC_CD)
                    setMachine(info.MC_CODE)

                    setCheckItems(items => items.map(item => {
                        let leftSetting = '', rightSetting = '', leftDisplay = '', rightDisplay = ''

                        if (item.id === 1) {
                            leftSetting = info.LOWER_SETTING_L != null ? String(info.LOWER_SETTING_L) : ''
                            rightSetting = info.LOWER_SETTING_R != null ? String(info.LOWER_SETTING_R) : ''
                            leftDisplay = info.LOWER_DISPLAY_L != null ? String(info.LOWER_DISPLAY_L) : ''
                            rightDisplay = info.LOWER_DISPLAY_R != null ? String(info.LOWER_DISPLAY_R) : ''
                        } else if (item.id === 2) {
                            leftSetting = info.MIDDLE_SETTING_L != null ? String(info.MIDDLE_SETTING_L) : ''
                            rightSetting = info.MIDDLE_SETTING_R != null ? String(info.MIDDLE_SETTING_R) : ''
                            leftDisplay = info.MIDDLE_DISPLAY_L != null ? String(info.MIDDLE_DISPLAY_L) : ''
                            rightDisplay = info.MIDDLE_DISPLAY_R != null ? String(info.MIDDLE_DISPLAY_R) : ''
                        } else if (item.id === 3) {
                            leftSetting = info.UPPER_SETTING_L != null ? String(info.UPPER_SETTING_L) : ''
                            rightSetting = info.UPPER_SETTING_R != null ? String(info.UPPER_SETTING_R) : ''
                            leftDisplay = info.UPPER_DISPLAY_L != null ? String(info.UPPER_DISPLAY_L) : ''
                            rightDisplay = info.UPPER_DISPLAY_R != null ? String(info.UPPER_DISPLAY_R) : ''
                        }

                        return {
                            ...item,
                            left: { ...item.left, settingValue: leftSetting, displayValue: leftDisplay },
                            right: { ...item.right, settingValue: rightSetting, displayValue: rightDisplay }
                        }
                    }))

                    try {
                        const [plantRes, lineRes, processRes, machineRes] = await Promise.all([
                            getComboData('CBO_PLANT', { condition1: info.FAC_CD }),
                            getComboData('CBO_LINE', { condition1: info.FAC_CD, condition2: info.PLANT_CD }),
                            getComboData('CBO_PROCESS', { condition1: info.FAC_CD, condition2: info.PLANT_CD, condition3: info.LINE_CD }),
                            getComboData('CBO_MACHINE', { condition1: info.FAC_CD, condition2: info.PLANT_CD, condition3: info.LINE_CD, condition4: info.LOC_CD })
                        ])

                        if (plantRes?.success && plantRes?.data?.OUT_CURSOR) {
                            setPlantList(plantRes.data.OUT_CURSOR.filter((item: any) => item.NAME !== 'All' && item.CODE !== 'All'))
                        }
                        if (lineRes?.success && lineRes?.data?.OUT_CURSOR) {
                            setLineList(lineRes.data.OUT_CURSOR.filter((item: any) => item.NAME !== 'All' && item.CODE !== 'All'))
                        }
                        if (processRes?.success && processRes?.data?.OUT_CURSOR) {
                            setProcessList(processRes.data.OUT_CURSOR.filter((item: any) => item.NAME !== 'All' && item.CODE !== 'All'))
                        }
                        if (machineRes?.success && machineRes?.data?.OUT_CURSOR) {
                            setMachineList(machineRes.data.OUT_CURSOR.filter((item: any) => item.NAME !== 'All' && item.CODE !== 'All'))
                        }
                    } catch (err) {
                        console.error("Error fetching combo lists:", err)
                    }
                } else {
                    showNotification('error', t('notification.error'), t('notification.deviceNotFound'))
                }
            } catch (err) {
                console.error("Error fetching QR info:", err)
                showNotification('error', t('notification.error'), t('notification.deviceError'))
            }
        }
    }

    const isFGA = process?.toUpperCase()?.startsWith('FGA')

    return (
        <Box sx={{ pb: 4 }}>
            {/* Header - Left Aligned */}
            <Box sx={{ textAlign: 'left', mb: { xs: 3, md: 5 } }}>
                <Typography
                    variant="h5"
                    fontWeight={800}
                    sx={{ color: 'primary.main', mb: 0.5, fontSize: { xs: '1.15rem', md: '1.9rem' }, letterSpacing: '-0.02em' }}
                >
                    {t('temperature.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '1.05rem' }, fontWeight: 500 }}>
                    {t('temperature.subtitle')}
                </Typography>
            </Box>

            {/* Form Section */}
            <Paper elevation={1} sx={{ p: { xs: 1.5, md: 1.8 }, borderRadius: 3, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5, color: 'primary.main', fontSize: { xs: '0.9rem', md: '1.2rem' } }}>
                    {t('temperature.inspectionInfo')}
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1.5 }}>
                    <FormControl fullWidth size="small" disabled>
                        <InputLabel>{t('temperature.area')}</InputLabel>
                        <Select value={area} onChange={handleAreaChange} label={t('temperature.area')}>
                            {areaList.map((item, index) => (
                                <MenuItem key={index} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" disabled>
                        <InputLabel>{t('temperature.plant')}</InputLabel>
                        <Select value={plant} onChange={handlePlantChange} label={t('temperature.plant')}>
                            {plantList.map((item, index) => (
                                <MenuItem key={index} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" disabled>
                        <InputLabel>{t('temperature.line')}</InputLabel>
                        <Select value={line} onChange={handleLineChange} label={t('temperature.line')}>
                            {lineList.map((item, index) => (
                                <MenuItem key={index} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" disabled>
                        <InputLabel>{t('temperature.process')}</InputLabel>
                        <Select value={process} onChange={handleProcessChange} label={t('temperature.process')}>
                            {processList.map((item, index) => (
                                <MenuItem key={index} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" disabled>
                        <InputLabel>{t('temperature.machine')}</InputLabel>
                        <Select value={machine} onChange={handleMachineChange} label={t('temperature.machine')}>
                            {machineList.map((item, index) => (
                                <MenuItem key={index} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <CustomDatePicker
                        selected={inspectionDate}
                        onChange={(date) => setInspectionDate(date)}
                        label={t('temperature.checkDate')}
                        disabled
                    />
                </Box>
            </Paper>

            {/* Checklist Table */}
            {/* Checklist Table */}
            <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table size="small" sx={{ tableLayout: 'fixed' }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: isDark ? '#1e3a5f' : '#1565c0' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '16%', py: { xs: 1, md: 2 }, px: 0.5, fontSize: { xs: '0.65rem', md: '0.9rem' }, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)' }}>{t('temperature.category')}</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '13%', py: { xs: 1, md: 2 }, px: 0.5, fontSize: { xs: '0.65rem', md: '0.9rem' }, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)' }}>{t('temperature.position')}</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', width: '17%', py: { xs: 1, md: 2 }, px: 0.5, fontSize: { xs: '0.65rem', md: '0.9rem' }, borderRight: '1px solid rgba(255,255,255,0.2)' }}>{t('common.setting')}</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', width: '17%', py: { xs: 1, md: 2 }, px: 0.5, fontSize: { xs: '0.65rem', md: '0.9rem' }, borderRight: '1px solid rgba(255,255,255,0.2)' }}>{t('common.display')}</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', width: '17%', py: { xs: 1, md: 2 }, px: 0.5, fontSize: { xs: '0.65rem', md: '0.9rem' }, borderRight: '1px solid rgba(255,255,255,0.2)' }}>{t('common.value')}</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '20%', py: { xs: 1, md: 2 }, px: 0.5, fontSize: { xs: '0.65rem', md: '0.9rem' }, textAlign: 'center' }}>{t('common.remarks')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {checkItems
                                .filter(item => !(isFGA && item.id === 2))
                                .map((item) => {
                                    const getItemSuffix = () => {
                                        if (!isFGA) return ''
                                        if (item.id === 1) return ' (Upper)'
                                        if (item.id === 3) return ' (F/S)'
                                        return ''
                                    }

                                    return (
                                        <React.Fragment key={item.id}>
                                            <TableRow sx={{ '&:hover': { bgcolor: isDark ? 'rgba(100, 181, 246, 0.08)' : 'rgba(21, 101, 192, 0.04)' } }}>
                                                <TableCell rowSpan={2} sx={{ fontWeight: 'bold', borderRight: 1, borderRightColor: 'divider', fontSize: { xs: '0.65rem', md: '0.95rem' }, p: { xs: 0.5, md: 1.5 }, textAlign: 'center' }}>
                                                    <Box>
                                                        {t(item.name)}
                                                        {getItemSuffix() && (
                                                            <Typography variant="caption" sx={{ display: 'block', fontSize: { xs: '0.55rem', md: '0.75rem' }, color: 'text.secondary', mt: 0.25 }}>
                                                                {getItemSuffix()}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ fontSize: { xs: '0.65rem', md: '0.9rem' }, p: { xs: 0.5, md: 1.5 }, textAlign: 'center', borderRight: 1, borderRightColor: 'divider' }}>{t('temperature.left')}</TableCell>
                                                <TableCell sx={{ p: { xs: 0.5, md: 1 }, borderRight: 1, borderRightColor: 'divider' }}>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={item.left.settingValue}
                                                        onChange={(e) => handleSettingValueChange(item.id, 'left', e.target.value)}
                                                        sx={{ '& input': { textAlign: 'center', p: { xs: '4px', md: '8px' }, fontSize: { xs: '0.75rem', md: '1rem' } }, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ p: { xs: 0.5, md: 1 }, borderRight: 1, borderRightColor: 'divider' }}>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={item.left.displayValue}
                                                        onChange={(e) => handleDisplayValueChange(item.id, 'left', e.target.value)}
                                                        sx={{ '& input': { textAlign: 'center', p: { xs: '4px', md: '8px' }, fontSize: { xs: '0.75rem', md: '1rem' } }, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ p: { xs: 0.5, md: 1 }, borderRight: 1, borderRightColor: 'divider' }}>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={item.left.value}
                                                        onChange={(e) => handleValueChange(item.id, 'left', e.target.value)}
                                                        sx={{ '& input': { textAlign: 'center', p: { xs: '4px', md: '8px' }, fontSize: { xs: '0.75rem', md: '1rem' } }, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                                    />
                                                </TableCell>
                                                <TableCell
                                                    sx={{ cursor: 'pointer', p: { xs: 0.5, md: 1.5 }, fontSize: { xs: '0.65rem', md: '0.85rem' }, textAlign: 'center', '&:hover': { bgcolor: isDark ? 'rgba(100, 181, 246, 0.12)' : 'rgba(21, 101, 192, 0.08)' } }}
                                                    onClick={() => handleRemarkClick(item.id, 'left')}
                                                >
                                                    <Typography variant="caption" color={item.left.remark ? 'text.primary' : 'text.secondary'} sx={{ fontSize: { xs: '0.6rem', md: '0.8rem' }, display: 'block', lineHeight: 1.1 }}>
                                                        {item.left.remark || 'Click to add'}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow sx={{ '&:hover': { bgcolor: isDark ? 'rgba(100, 181, 246, 0.08)' : 'rgba(21, 101, 192, 0.04)' } }}>
                                                <TableCell sx={{ fontSize: { xs: '0.65rem', md: '0.9rem' }, p: { xs: 0.5, md: 1.5 }, textAlign: 'center', borderRight: 1, borderRightColor: 'divider' }}>{t('temperature.right')}</TableCell>
                                                <TableCell sx={{ p: { xs: 0.5, md: 1 }, borderRight: 1, borderRightColor: 'divider' }}>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={item.right.settingValue}
                                                        onChange={(e) => handleSettingValueChange(item.id, 'right', e.target.value)}
                                                        sx={{ '& input': { textAlign: 'center', p: { xs: '4px', md: '8px' }, fontSize: { xs: '0.75rem', md: '1rem' } }, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ p: { xs: 0.5, md: 1 }, borderRight: 1, borderRightColor: 'divider' }}>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={item.right.displayValue}
                                                        onChange={(e) => handleDisplayValueChange(item.id, 'right', e.target.value)}
                                                        sx={{ '& input': { textAlign: 'center', p: { xs: '4px', md: '8px' }, fontSize: { xs: '0.75rem', md: '1rem' } }, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ p: { xs: 0.5, md: 1 }, borderRight: 1, borderRightColor: 'divider' }}>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={item.right.value}
                                                        onChange={(e) => handleValueChange(item.id, 'right', e.target.value)}
                                                        sx={{ '& input': { textAlign: 'center', p: { xs: '4px', md: '8px' }, fontSize: { xs: '0.75rem', md: '1rem' } }, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                                    />
                                                </TableCell>
                                                <TableCell
                                                    sx={{ cursor: 'pointer', p: { xs: 0.5, md: 1.5 }, fontSize: { xs: '0.65rem', md: '0.85rem' }, textAlign: 'center', '&:hover': { bgcolor: isDark ? 'rgba(100, 181, 246, 0.12)' : 'rgba(21, 101, 192, 0.08)' } }}
                                                    onClick={() => handleRemarkClick(item.id, 'right')}
                                                >
                                                    <Typography variant="caption" color={item.right.remark ? 'text.primary' : 'text.secondary'} sx={{ fontSize: { xs: '0.6rem', md: '0.8rem' }, display: 'block', lineHeight: 1.1 }}>
                                                        {item.right.remark || 'Click to add'}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    )
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                <Button
                    variant="outlined"
                    size="large"
                    startIcon={<RefreshIcon />}
                    onClick={resetForm}
                    sx={{
                        borderRadius: 3,
                        minWidth: { xs: 130, md: 180 },
                        py: { xs: 1, md: 1.5 },
                        borderColor: '#ef5350',
                        color: '#ef5350',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.9rem', md: '1.1rem' },
                        '&:hover': {
                            borderColor: '#d32f2f',
                            color: '#d32f2f',
                            bgcolor: isDark ? 'rgba(239, 83, 80, 0.08)' : 'rgba(239, 83, 80, 0.04)'
                        }
                    }}
                >
                    {t('common.cancel')}
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    endIcon={<SendIcon />}
                    onClick={handleSubmit}
                    sx={{
                        borderRadius: 3,
                        minWidth: { xs: 130, md: 180 },
                        py: { xs: 1, md: 1.5 },
                        background: isDark
                            ? 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)'
                            : 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                        boxShadow: isDark
                            ? '0 4px 20px rgba(66, 165, 245, 0.4)'
                            : '0 4px 12px rgba(21, 101, 192, 0.3)',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.9rem', md: '1.1rem' },
                        '&:hover': {
                            background: isDark
                                ? 'linear-gradient(135deg, #64b5f6 0%, #1e88e5 100%)'
                                : 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                            boxShadow: isDark
                                ? '0 6px 25px rgba(66, 165, 245, 0.5)'
                                : '0 6px 16px rgba(21, 101, 192, 0.4)'
                        }
                    }}
                >
                    {t('common.submit')}
                </Button>
            </Box>

            {/* Floating QR Button */}
            <Fab
                color="primary"
                sx={{
                    position: 'fixed',
                    bottom: { xs: 90, sm: 30 },
                    right: 20,
                    background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #5a0db3 0%, #1e65e0 100%)' }
                }}
                onClick={() => {
                    setCameraKey(prev => prev + 1)
                    setOpenCamera(true)
                }}
            >
                <QrCodeScannerIcon />
            </Fab>

            {/* QR Scanner Dialog */}
            {openCamera && (
                <CameraScan key={cameraKey} open={openCamera} handleSuccess={handleScanSuccess} handleClose={handleCloseCamera} />
            )}

            {/* Remark Popup */}
            <RemarkPopup
                isOpen={showRemarkPopup}
                onClose={handleCloseRemarkPopup}
                onSave={handleSaveRemark}
                initialRemark={tempRemarkValue}
            />

            {/* Notification Dialog */}
            <Dialog
                open={notificationDialog.open}
                onClose={() => setNotificationDialog({ ...notificationDialog, open: false })}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {notificationDialog.type === 'success' ? (
                        <CheckCircleOutlineIcon color="success" />
                    ) : (
                        <ErrorOutlineIcon color="error" />
                    )}
                    {notificationDialog.title}
                    <IconButton
                        sx={{ ml: 'auto' }}
                        onClick={() => setNotificationDialog({ ...notificationDialog, open: false })}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography>{notificationDialog.message}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={() => setNotificationDialog({ ...notificationDialog, open: false })}
                        sx={{
                            background: notificationDialog.type === 'success'
                                ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                                : 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)'
                        }}
                    >
                        {t('common.ok')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default Temperature
