import { useState, useEffect, useMemo } from 'react'
import { getComboData, getHistoryData } from '../../api'
import { useTranslation } from '../../contexts/LanguageContext'
import { useThemeMode } from '../../contexts/ThemeContext'
import CustomDatePicker from '../../components/common/CustomDatePicker'
import { format } from 'date-fns'
import {
    Box,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
    Avatar,
    Chip,
    Pagination,
    ToggleButton,
    ToggleButtonGroup,
    CircularProgress,
    Divider,
    TextField
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'
import SearchIcon from '@mui/icons-material/Search'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import ViewListIcon from '@mui/icons-material/ViewList'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ThermostatIcon from '@mui/icons-material/Thermostat'

const History = () => {
    const { t } = useTranslation()
    const { isDark } = useThemeMode()
    const [startDate, setStartDate] = useState<Date | null>(new Date())
    const [endDate, setEndDate] = useState<Date | null>(new Date())
    const [area, setArea] = useState('')
    const [plant, setPlant] = useState('')
    const [line, setLine] = useState('')
    const [process, setProcess] = useState('')
    const [machine, setMachine] = useState('')

    const [isSearching, setIsSearching] = useState(false)
    const [historyList, setHistoryList] = useState<any[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const [viewMode, setViewMode] = useState<'grid' | 'card'>('grid')
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    const [jumpPage, setJumpPage] = useState('')

    const handleJumpSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        const pageNum = parseInt(jumpPage)
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            setCurrentPage(pageNum)
            setJumpPage('')
        }
    }

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768
            setIsMobile(mobile)
            setCurrentPage(1)
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set())

    const pivotedRows = useMemo(() => {
        if (historyList.length === 0) return []
        const groups: { [key: string]: any[] } = {}
        historyList.forEach(item => {
            const key = `${item.YMD}_${item.HMS}_${item.MACH_ID}`
            if (!groups[key]) groups[key] = []
            groups[key].push(item)
        })

        const rows: any[] = []
        Object.values(groups).forEach(groupItems => {
            const leftItems = groupItems.filter(i => i.DIV?.toLowerCase() === 'left')
            const rightItems = groupItems.filter(i => i.DIV?.toLowerCase() === 'right')
            const base = groupItems[0]
            const getData = (items: any[], loc: string) => items.find(i => i.LOCATE?.toLowerCase() === loc.toLowerCase())
            const hasLeft = leftItems.length > 0
            const hasRight = rightItems.length > 0
            const rowCount = (hasLeft ? 1 : 0) + (hasRight ? 1 : 0)

            if (hasLeft) {
                rows.push({
                    ...base, isRow: 'Left', isFirstInGroup: true, groupRowCount: rowCount,
                    lower: getData(leftItems, 'Lower'),
                    middle: getData(leftItems, 'Middle'),
                    upper: getData(leftItems, 'Upper')
                })
            }
            if (hasRight) {
                rows.push({
                    ...base, isRow: 'Right', isFirstInGroup: !hasLeft, groupRowCount: hasLeft ? 0 : rowCount,
                    lower: getData(rightItems, 'Lower'),
                    middle: getData(rightItems, 'Middle'),
                    upper: getData(rightItems, 'Upper')
                })
            }
        })
        return rows
    }, [historyList])

    const mergedCardsData = useMemo(() => {
        if (historyList.length === 0) return []
        const groups: { [key: string]: any[] } = {}
        historyList.forEach(item => {
            const key = `${item.YMD}_${item.HMS}_${item.MACH_ID}`
            if (!groups[key]) groups[key] = []
            groups[key].push(item)
        })

        const cards: any[] = []
        Object.values(groups).forEach(groupItems => {
            const leftItems = groupItems.filter(i => i.DIV?.toLowerCase() === 'left')
            const rightItems = groupItems.filter(i => i.DIV?.toLowerCase() === 'right')

            // Ưu tiên chọn base là item có chứa tên quy trình hoặc máy
            const base = groupItems.find(i => i.PROC_NM || i.OP_NM || i.OP_NAME || i.MACH_NM || i.PROC_NAME) || groupItems[0]

            const getData = (items: any[], loc: string) => items.find(i => i.LOCATE?.toLowerCase() === loc.toLowerCase())
            cards.push({
                ...base,
                lowerLeft: getData(leftItems, 'Lower'), lowerRight: getData(rightItems, 'Lower'),
                middleLeft: getData(leftItems, 'Middle'), middleRight: getData(rightItems, 'Middle'),
                upperLeft: getData(leftItems, 'Upper'), upperRight: getData(rightItems, 'Upper'),
            })
        })
        return cards
    }, [historyList])

    useEffect(() => { setCurrentPage(1) }, [historyList])
    useEffect(() => { setCurrentPage(1) }, [viewMode])

    const gridTotalPages = Math.ceil(pivotedRows.length / itemsPerPage) || 1
    const cardTotalPages = Math.ceil(mergedCardsData.length / itemsPerPage) || 1
    const useCardView = isMobile && viewMode === 'card'
    const totalPages = useCardView ? cardTotalPages : gridTotalPages
    const dataForPagination = useCardView ? mergedCardsData : pivotedRows
    const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages)

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages)
        else if (currentPage < 1) setCurrentPage(1)
    }, [currentPage, totalPages])

    const indexOfLastItem = validCurrentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const visibleRows = pivotedRows.slice(indexOfFirstItem, indexOfLastItem)
    const visibleCards = mergedCardsData.slice(indexOfFirstItem, indexOfLastItem)

    const toggleIssue = (key: string) => {
        setExpandedIssues(prev => {
            const newSet = new Set(prev)
            if (newSet.has(key)) newSet.delete(key)
            else newSet.add(key)
            return newSet
        })
    }

    const truncateIssue = (text: string, isExpanded: boolean): string => {
        if (isExpanded || !text) return text
        const words = text.trim().split(/\s+/)
        if (words.length <= 1) return text
        return words[0] + '...'
    }

    const [areaList, setAreaList] = useState<any[]>([])
    const [plantList, setPlantList] = useState<any[]>([])
    const [lineList, setLineList] = useState<any[]>([])
    const [processList, setProcessList] = useState<any[]>([])
    const [machineList, setMachineList] = useState<any[]>([])

    const loadMachineList = async (areaVal: string, plantVal: string, lineVal: string, processVal: string) => {
        try {
            const result = await getComboData('CBO_MACHINE', { condition1: areaVal, condition2: plantVal, condition3: lineVal, condition4: processVal })
            if (result?.success && result?.data?.OUT_CURSOR) {
                setMachineList(result.data.OUT_CURSOR)
                if (result.data.OUT_CURSOR.length > 0) setMachine(result.data.OUT_CURSOR[0].CODE || result.data.OUT_CURSOR[0].NAME || '')
            }
        } catch (err) { console.error('Error loading machine list:', err) }
    }

    const loadProcessList = async (areaVal: string, plantVal: string, lineVal: string) => {
        try {
            const result = await getComboData('CBO_PROCESS', { condition1: areaVal, condition2: plantVal, condition3: lineVal })
            if (result?.success && result?.data?.OUT_CURSOR) {
                setProcessList(result.data.OUT_CURSOR)
                if (result.data.OUT_CURSOR.length > 0) {
                    const val = result.data.OUT_CURSOR[0].CODE || result.data.OUT_CURSOR[0].NAME || ''
                    setProcess(val)
                    if (val) loadMachineList(areaVal, plantVal, lineVal, val)
                }
            }
        } catch (err) { console.error('Error loading process list:', err) }
    }

    const loadLineList = async (areaVal: string, plantVal: string) => {
        try {
            const result = await getComboData('CBO_LINE', { condition1: areaVal, condition2: plantVal })
            if (result?.success && result?.data?.OUT_CURSOR) {
                setLineList(result.data.OUT_CURSOR)
                if (result.data.OUT_CURSOR.length > 0) {
                    const val = result.data.OUT_CURSOR[0].CODE || result.data.OUT_CURSOR[0].NAME || ''
                    setLine(val)
                    if (val) loadProcessList(areaVal, plantVal, val)
                }
            }
        } catch (err) { console.error('Error loading line list:', err) }
    }

    const loadPlantList = async (areaVal: string) => {
        try {
            const result = await getComboData('CBO_PLANT', { condition1: areaVal })
            if (result?.success && result?.data?.OUT_CURSOR) {
                setPlantList(result.data.OUT_CURSOR)
                if (result.data.OUT_CURSOR.length > 0) {
                    const val = result.data.OUT_CURSOR[0].CODE || result.data.OUT_CURSOR[0].NAME || ''
                    setPlant(val)
                    if (val) loadLineList(areaVal, val)
                }
            }
        } catch (err) { console.error('Error loading plant list:', err) }
    }

    useEffect(() => {
        const loadAreaList = async () => {
            try {
                const result = await getComboData('CBO_FAC')
                if (result?.success && result?.data?.OUT_CURSOR) {
                    setAreaList(result.data.OUT_CURSOR)
                    if (result.data.OUT_CURSOR.length > 0) {
                        const val = result.data.OUT_CURSOR[0].CODE || result.data.OUT_CURSOR[0].NAME || ''
                        setArea(val)
                        if (val) loadPlantList(val)
                    }
                }
            } catch (err) { console.error('Error loading area list:', err) }
        }
        loadAreaList()
    }, [])

    const handleAreaChange = (e: SelectChangeEvent<string>) => {
        const value = e.target.value
        setArea(value)
        setPlant(''); setLine(''); setProcess(''); setMachine('')
        setPlantList([]); setLineList([]); setProcessList([]); setMachineList([])
        if (value) loadPlantList(value)
    }

    const handlePlantChange = (e: SelectChangeEvent<string>) => {
        const value = e.target.value
        setPlant(value)
        setLine(''); setProcess(''); setMachine('')
        setLineList([]); setProcessList([]); setMachineList([])
        if (value && area) loadLineList(area, value)
    }

    const handleLineChange = (e: SelectChangeEvent<string>) => {
        const value = e.target.value
        setLine(value)
        setProcess(''); setMachine('')
        setProcessList([]); setMachineList([])
        if (value && area && plant) loadProcessList(area, plant, value)
    }

    const handleProcessChange = (e: SelectChangeEvent<string>) => {
        const value = e.target.value
        setProcess(value)
        setMachine('')
        setMachineList([])
        if (value && area && plant && line) loadMachineList(area, plant, line, value)
    }

    const handleSearch = async () => {
        setIsSearching(true)
        try {
            const result = await getHistoryData({
                qtype: 'Q',
                ymdf: startDate ? format(startDate, 'yyyyMMdd') : '',
                ymdt: endDate ? format(endDate, 'yyyyMMdd') : '',
                fac: area, plant: plant, line: line, opcd: process, machine: machine
            })
            if (result?.success && result?.data?.OUT_CURSOR) setHistoryList(result.data.OUT_CURSOR)
            else setHistoryList([])
        } catch (err) {
            console.error('Error searching history:', err)
            setHistoryList([])
        } finally {
            setIsSearching(false)
        }
    }

    const renderTemperatureCell = (data: any, position: string, idx: number, isLast: boolean = false) => {
        const issueKey = `grid_${idx}_${position}`

        if (!data) {
            return (
                <>
                    <TableCell align="center" sx={{ p: { xs: 0.5, md: 1 }, borderRight: 1, borderRightColor: 'divider' }} />
                    <TableCell align="center" sx={{ p: { xs: 0.5, md: 1 }, borderRight: isLast ? 'none' : 1, borderRightColor: isLast ? 'transparent' : 'divider' }} />
                </>
            )
        }

        return (
            <>
                <TableCell align="center" sx={{ p: { xs: 0.5, md: 1 }, borderRight: 1, borderRightColor: 'divider' }}>
                    <Chip
                        icon={<ThermostatIcon sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }} />}
                        label={`${data.CHECK_VALUES}°C`}
                        size="small"
                        color={data.CHECK_STATUS === 'Pass' ? 'success' : 'error'}
                        variant="outlined"
                        sx={{ fontSize: { xs: '0.65rem', md: '0.8rem' }, height: { xs: 20, md: 24 } }}
                    />
                </TableCell>
                <TableCell
                    align="center"
                    sx={{
                        color: 'error.main',
                        cursor: data.ISSUE ? 'pointer' : 'default',
                        maxWidth: 100,
                        p: { xs: 0.5, md: 1 },
                        borderRight: isLast ? 'none' : 1,
                        borderRightColor: isLast ? 'transparent' : 'divider'
                    }}
                    onClick={() => data.ISSUE && toggleIssue(issueKey)}
                >
                    <Typography variant="caption" noWrap={!expandedIssues.has(issueKey)} sx={{ fontSize: { xs: '0.6rem', md: '0.75rem' } }}>
                        {data.ISSUE ? truncateIssue(data.ISSUE, expandedIssues.has(issueKey)) : ''}
                    </Typography>
                </TableCell>
            </>
        )
    }

    return (
        <Box sx={{ pb: 4 }}>
            {/* Header - Left Aligned */}
            <Box sx={{ textAlign: 'left', mb: { xs: 3, md: 5 } }}>
                <Typography variant="h5" fontWeight="bold" sx={{ color: 'primary.main', mb: 0.5, fontSize: { xs: '1.3rem', md: '1.8rem' } }}>
                    {t('history.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', md: '1.1rem' } }}>
                    {t('history.subtitle')}
                </Typography>
            </Box>

            {/* Filters */}
            <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 3 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2 }}>
                    <CustomDatePicker selected={startDate} onChange={setStartDate} label={t('history.fromDate')} />
                    <CustomDatePicker selected={endDate} onChange={setEndDate} label={t('history.toDate')} />
                    <FormControl fullWidth size="small">
                        <InputLabel>{t('history.area')}</InputLabel>
                        <Select value={area} onChange={handleAreaChange} label={t('history.area')}>
                            {areaList.map((item, idx) => <MenuItem key={idx} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                        <InputLabel>{t('temperature.plant')}</InputLabel>
                        <Select value={plant} onChange={handlePlantChange} label={t('temperature.plant')}>
                            {plantList.map((item, idx) => <MenuItem key={idx} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>{t('temperature.line')}</InputLabel>
                        <Select value={line} onChange={handleLineChange} label={t('temperature.line')}>
                            {lineList.map((item, idx) => <MenuItem key={idx} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                        <InputLabel>{t('temperature.process')}</InputLabel>
                        <Select value={process} onChange={handleProcessChange} label={t('temperature.process')}>
                            {processList.map((item, idx) => <MenuItem key={idx} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                        <InputLabel>{t('temperature.machine')}</InputLabel>
                        <Select value={machine} onChange={(e) => setMachine(e.target.value)} label={t('temperature.machine')}>
                            {machineList.map((item, idx) => <MenuItem key={idx} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        startIcon={isSearching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                        onClick={handleSearch}
                        disabled={isSearching}
                        sx={{
                            background: isDark
                                ? 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)'
                                : 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                            borderRadius: 2,
                            px: { md: 4 },
                            py: { md: 1.2 },
                            textTransform: 'none',
                            boxShadow: isDark ? '0 4px 20px rgba(66, 165, 245, 0.4)' : '0 4px 12px rgba(21, 101, 192, 0.3)',
                            '&:hover': {
                                background: isDark
                                    ? 'linear-gradient(135deg, #64b5f6 0%, #1e88e5 100%)'
                                    : 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                                boxShadow: isDark ? '0 6px 25px rgba(66, 165, 245, 0.5)' : '0 6px 16px rgba(21, 101, 192, 0.4)',
                            }
                        }}
                    >
                        {isSearching ? t('common.searching') : t('common.search')}
                    </Button>
                </Box>
            </Paper>

            {/* View Mode Toggle - Mobile Only */}
            {isMobile && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)} size="small">
                        <ToggleButton value="grid"><ViewListIcon /></ToggleButton>
                        <ToggleButton value="card"><ViewModuleIcon /></ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            )}

            {/* Table View */}
            {(!isMobile || viewMode === 'grid') && (
                <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 2 }}>
                    <TableContainer sx={{ maxHeight: 500 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow sx={{ '& th': { background: isDark ? '#1e3a5f' : '#1565c0', color: 'white', fontWeight: 'bold', fontSize: { xs: '0.65rem', md: '0.95rem' }, py: { xs: 1, md: 2 }, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)', px: 0.5 } }}>
                                    <TableCell rowSpan={2} sx={{ minWidth: { xs: 42, md: 80 } }}>{t('history.date')}</TableCell>
                                    <TableCell rowSpan={2} sx={{ minWidth: { xs: 60, md: 100 } }}>{t('history.inspector')}</TableCell>
                                    <TableCell rowSpan={2} sx={{ minWidth: { xs: 100, md: 180 } }}>{t('history.area')}</TableCell>
                                    <TableCell rowSpan={2} sx={{ minWidth: { xs: 60, md: 100 } }}>{t('history.machine')}</TableCell>
                                    <TableCell rowSpan={2}>{t('history.lr')}</TableCell>
                                    <TableCell colSpan={2} align="center">{t('history.lower')}</TableCell>
                                    <TableCell colSpan={2} align="center">{t('history.middle')}</TableCell>
                                    <TableCell colSpan={2} align="center" sx={{ borderRight: 'none' }}>{t('history.upper')}</TableCell>
                                </TableRow>
                                <TableRow sx={{ '& th': { background: '#1e88e5', color: 'white', fontSize: { xs: '0.6rem', md: '0.85rem' }, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)', px: 0.5, py: 0.5 } }}>
                                    <TableCell>{t('history.temperature')}</TableCell>
                                    <TableCell>{t('history.issue')}</TableCell>
                                    <TableCell>{t('history.temperature')}</TableCell>
                                    <TableCell>{t('history.issue')}</TableCell>
                                    <TableCell>{t('history.temperature')}</TableCell>
                                    <TableCell sx={{ borderRight: 'none' }}>{t('history.issue')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {visibleRows.length === 0 ? (
                                    <TableRow><TableCell colSpan={11} align="center" sx={{ py: 4, fontSize: '0.8rem' }}>{t('history.noData')}</TableCell></TableRow>
                                ) : visibleRows.map((row, idx) => (
                                    <TableRow key={idx} sx={{ '&:hover': { bgcolor: isDark ? 'rgba(100, 181, 246, 0.08)' : 'rgba(21, 101, 192, 0.04)' } }}>
                                        {row.isFirstInGroup && (
                                            <>
                                                <TableCell rowSpan={row.groupRowCount} align="center" sx={{ px: { xs: 0.2, md: 0.5 }, py: 0.5, borderRight: 1, borderRightColor: 'divider' }}>
                                                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.7rem', md: '0.85rem' }, whiteSpace: 'nowrap' }}>{row.YMD?.toString().split(' ')[0]}</Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', md: '0.75rem' } }}>{row.HMS}</Typography>
                                                </TableCell>
                                                <TableCell rowSpan={row.groupRowCount} align="center" sx={{ p: 0.5, fontSize: { xs: '0.7rem', md: '0.85rem' }, borderRight: 1, borderRightColor: 'divider' }}>{row.EMP_NM}</TableCell>
                                                <TableCell rowSpan={row.groupRowCount} align="center" sx={{ p: 0.5, fontSize: { xs: '0.65rem', md: '0.85rem' }, borderRight: 1, borderRightColor: 'divider' }}>{row.CMMS_LOC_NM || '-'}</TableCell>
                                                <TableCell rowSpan={row.groupRowCount} align="center" sx={{ p: 0.5, borderRight: 1, borderRightColor: 'divider' }}>
                                                    <Chip size="small" label={row.MACH_ID} sx={{ fontSize: { xs: '0.6rem', md: '0.75rem' }, height: 20 }} />
                                                </TableCell>
                                            </>
                                        )}
                                        <TableCell align="center" sx={{ p: 0.5, borderRight: 1, borderRightColor: 'divider' }}>
                                            <Chip
                                                size="small"
                                                label={row.isRow}
                                                color={row.isRow === 'Left' ? 'primary' : 'secondary'}
                                                variant="outlined"
                                                sx={{
                                                    fontSize: { xs: '0.6rem', md: '0.75rem' },
                                                    height: 20,
                                                    minWidth: 55 // Fixed width to make Left and Right sizes equal
                                                }}
                                            />
                                        </TableCell>
                                        {renderTemperatureCell(row.lower, 'lower', idx)}
                                        {renderTemperatureCell(row.middle, 'middle', idx)}
                                        {renderTemperatureCell(row.upper, 'upper', idx, true)}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Card View - Mobile Only - Ultra-Compact & Edge-to-Edge Redesign */}
            {isMobile && viewMode === 'card' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 0.5, px: 0 }}>
                    {visibleCards.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: isDark ? 'background.paper' : '#fbfbfb', border: isDark ? '1px dashed rgba(255,255,255,0.2)' : '1px dashed #ccc' }}>
                            <Typography color="text.secondary" variant="body2">{t('history.noData')}</Typography>
                        </Paper>
                    ) : visibleCards.map((card, index) => {
                        return (
                            <Card key={index} sx={{
                                borderRadius: 3,
                                boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.06)',
                                overflow: 'hidden',
                                border: '1px solid',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                bgcolor: 'background.paper',
                                textAlign: 'center'
                            }}>
                                {/* Header - Left-aligned (Original Style) */}
                                <Box sx={{
                                    background: 'linear-gradient(135deg, #1e3a8a 0%, #171c4a 100%)',
                                    p: 1.2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    color: 'white'
                                }}>
                                    <Avatar sx={{
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        width: 38,
                                        height: 38,
                                        border: '1.5px solid rgba(255,193,7,0.3)',
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {card.EMP_NM?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'NA'}
                                    </Avatar>
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1.2 }}>{card.EMP_NM}</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 0.5, opacity: 0.8, mt: 0.2 }}>
                                            <AccessTimeIcon sx={{ fontSize: 13 }} />
                                            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>{card.YMD?.toString().split(' ')[0]} • {card.HMS}</Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                <CardContent sx={{ p: 0.8 }}>
                                    {/* Info Panel - Compact & Centered */}
                                    <Paper sx={{
                                        p: 0.8, mb: 0.8, borderRadius: 2,
                                        borderLeft: '4px solid',
                                        borderLeftColor: isDark ? 'primary.main' : '#1e3a8a',
                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                        boxShadow: 'none',
                                        border: '1px solid',
                                        borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#edf2f7'
                                    }}>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'block', mb: 0.1, fontSize: '0.6rem', textAlign: 'center' }}>{t('history.area')}</Typography>
                                                <Typography variant="body2" fontWeight="600" color="text.primary" sx={{ fontSize: '0.7rem', lineHeight: 1.1, textAlign: 'center' }}>{card.CMMS_LOC_NM || '-'}</Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'block', mb: 0.1, fontSize: '0.6rem', textAlign: 'center' }}>{t('history.machine')}</Typography>
                                                <Typography variant="body2" fontWeight="bold" color="primary.main" sx={{ fontSize: '0.7rem', lineHeight: 1.1, textAlign: 'center' }}>{card.MACH_ID}</Typography>
                                            </Box>
                                        </Box>
                                    </Paper>

                                    {/* Temperature Grids - Compact & Centered */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                        {['lower', 'middle', 'upper'].map((pos) => {
                                            const left = card[`${pos}Left`]
                                            const right = card[`${pos}Right`]
                                            if (!left && !right) return null

                                            const themes = {
                                                lower: {
                                                    color: isDark ? '#64b5f6' : '#2563eb',
                                                    bg: isDark ? 'rgba(100, 181, 246, 0.1)' : '#eff6ff',
                                                    border: isDark ? 'rgba(100, 181, 246, 0.2)' : '#dbeafe'
                                                },
                                                middle: {
                                                    color: isDark ? '#bb86fc' : '#7c3aed',
                                                    bg: isDark ? 'rgba(187, 134, 252, 0.1)' : '#f5f3ff',
                                                    border: isDark ? 'rgba(187, 134, 252, 0.2)' : '#ede9fe'
                                                },
                                                upper: {
                                                    color: isDark ? '#81c784' : '#059669',
                                                    bg: isDark ? 'rgba(129, 199, 132, 0.1)' : '#ecfdf5',
                                                    border: isDark ? 'rgba(129, 199, 132, 0.2)' : '#d1fae5'
                                                }
                                            }
                                            const theme = themes[pos as keyof typeof themes]

                                            return (
                                                <Box key={pos} sx={{
                                                    borderRadius: 2, bgcolor: 'background.paper',
                                                    border: `1px solid ${theme.border}`,
                                                    overflow: 'hidden'
                                                }}>
                                                    {/* Header Pill */}
                                                    <Box sx={{ bgcolor: theme.bg, py: 0.3, textAlign: 'center', borderBottom: `1px solid ${theme.border}` }}>
                                                        <Typography variant="caption" fontWeight="bold" sx={{ color: theme.color, fontSize: '0.65rem', textAlign: 'center', textTransform: 'capitalize' }}>
                                                            {t(`history.${pos}`)}
                                                        </Typography>
                                                    </Box>

                                                    {/* Values Row */}
                                                    <Box sx={{ display: 'flex', p: 0.6, alignItems: 'center' }}>
                                                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.2, fontSize: '0.6rem', textAlign: 'center' }}>{t('history.left')}</Typography>
                                                            {left ? (
                                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.4 }}>
                                                                    <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ fontSize: '0.75rem' }}>{left.CHECK_VALUES}°C</Typography>
                                                                    <Chip label="Pass" size="small" sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 'bold', height: 15, fontSize: '0.55rem' }} />
                                                                </Box>
                                                            ) : <Typography variant="caption" color="text.disabled">-</Typography>}
                                                        </Box>

                                                        <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dotted', mx: 0.5, height: 20, alignSelf: 'center' }} />

                                                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.2, fontSize: '0.6rem', textAlign: 'center' }}>{t('history.right')}</Typography>
                                                            {right ? (
                                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.4 }}>
                                                                    <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ fontSize: '0.75rem' }}>{right.CHECK_VALUES}°C</Typography>
                                                                    <Chip label="Pass" size="small" sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 'bold', height: 15, fontSize: '0.55rem' }} />
                                                                </Box>
                                                            ) : <Typography variant="caption" color="text.disabled">-</Typography>}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            )
                                        })}
                                    </Box>
                                </CardContent>
                            </Card>
                        )
                    })}
                </Box>
            )}

            {/* Pagination */}
            {dataForPagination.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, mt: 2, mb: 4 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, dataForPagination.length)} / {dataForPagination.length}
                    </Typography>
                    <Pagination
                        count={totalPages}
                        page={validCurrentPage}
                        onChange={(_, value) => setCurrentPage(value)}
                        color="primary"
                        size="small"
                        siblingCount={0}
                        boundaryCount={1}
                        showFirstButton
                        showLastButton
                    />
                    <Box component="form" onSubmit={handleJumpSubmit} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">Go to:</Typography>
                        <TextField
                            size="small"
                            value={jumpPage}
                            onChange={(e) => setJumpPage(e.target.value)}
                            sx={{ width: 60, '& .MuiInputBase-input': { py: 0.5, px: 1, fontSize: '0.75rem', textAlign: 'center' } }}
                            placeholder={`${validCurrentPage}`}
                        />
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleJumpSubmit()}
                            sx={{ minWidth: 40, height: 26, fontSize: '0.7rem', py: 0 }}
                        >
                            Go
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    )
}

export default History
