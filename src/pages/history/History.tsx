import { useState, useEffect, useMemo } from 'react'
import './History.css'
import { getComboData, getHistoryData } from '../../api'
import { useTranslation } from '../../contexts/LanguageContext'
import CustomDatePicker from '../../components/common/CustomDatePicker'
import { format } from 'date-fns'

const History = () => {
    const { t, language } = useTranslation()
    const [startDate, setStartDate] = useState<Date | null>(new Date())
    const [endDate, setEndDate] = useState<Date | null>(new Date())
    const [area, setArea] = useState('')
    const [plant, setPlant] = useState('')
    const [line, setLine] = useState('')
    const [process, setProcess] = useState('')
    const [machine, setMachine] = useState('')

    const [isSearching, setIsSearching] = useState(false)

    const [historyList, setHistoryList] = useState<any[]>([])

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // View mode state for mobile (grid or card)
    const [viewMode, setViewMode] = useState<'grid' | 'card'>('grid')

    // Detect if on mobile screen
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

    // Listen to window resize to detect mobile/desktop switch
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            // Reset page to 1 when switching between mobile and desktop
            setCurrentPage(1);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // State to track expanded issues (key = cardIndex_position_side)
    const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set())

    // Memoized pivot logic - transform raw data into displayable rows
    // Create separate Left/Right rows, but mark first row of each group for rowSpan
    const pivotedRows = useMemo(() => {
        if (historyList.length === 0) return [];

        // Group data by unique event (Date + Time + Machine)
        const groups: { [key: string]: any[] } = {};
        historyList.forEach(item => {
            const key = `${item.YMD}_${item.HMS}_${item.MACH_ID}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        });

        const rows: any[] = [];

        Object.values(groups).forEach(groupItems => {
            const leftItems = groupItems.filter(i => i.DIV?.toLowerCase() === 'left');
            const rightItems = groupItems.filter(i => i.DIV?.toLowerCase() === 'right');

            const base = groupItems[0];
            const getData = (items: any[], loc: string) => items.find(i => i.LOCATE?.toLowerCase() === loc.toLowerCase());

            const hasLeft = leftItems.length > 0;
            const hasRight = rightItems.length > 0;
            const rowCount = (hasLeft ? 1 : 0) + (hasRight ? 1 : 0);

            // Row 1: Left (if exists)
            if (hasLeft) {
                rows.push({
                    ...base,
                    isRow: 'Left',
                    isFirstInGroup: true,
                    groupRowCount: rowCount,
                    lower: getData(leftItems, 'Lower'),
                    middle: getData(leftItems, 'Middle'),
                    upper: getData(leftItems, 'Upper')
                });
            }

            // Row 2: Right (if exists)
            if (hasRight) {
                rows.push({
                    ...base,
                    isRow: 'Right',
                    isFirstInGroup: !hasLeft, // First only if no Left row
                    groupRowCount: hasLeft ? 0 : rowCount, // 0 means skip rowSpan
                    lower: getData(rightItems, 'Lower'),
                    middle: getData(rightItems, 'Middle'),
                    upper: getData(rightItems, 'Upper')
                });
            }
        });

        return rows;
    }, [historyList]);

    // Merged data for Card View - groups Left/Right into same card
    const mergedCardsData = useMemo(() => {
        if (historyList.length === 0) return [];

        // Group data by unique event (Date + Time + Machine)
        const groups: { [key: string]: any[] } = {};
        historyList.forEach(item => {
            const key = `${item.YMD}_${item.HMS}_${item.MACH_ID}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        });

        const cards: any[] = [];

        Object.values(groups).forEach(groupItems => {
            const leftItems = groupItems.filter(i => i.DIV?.toLowerCase() === 'left');
            const rightItems = groupItems.filter(i => i.DIV?.toLowerCase() === 'right');
            const base = groupItems[0];
            const getData = (items: any[], loc: string) => items.find(i => i.LOCATE?.toLowerCase() === loc.toLowerCase());

            cards.push({
                ...base,
                lowerLeft: getData(leftItems, 'Lower'),
                lowerRight: getData(rightItems, 'Lower'),
                middleLeft: getData(leftItems, 'Middle'),
                middleRight: getData(rightItems, 'Middle'),
                upperLeft: getData(leftItems, 'Upper'),
                upperRight: getData(rightItems, 'Upper'),
            });
        });

        return cards;
    }, [historyList]);

    // Reset page when history list changes
    useEffect(() => {
        setCurrentPage(1)
    }, [historyList])

    // Reset page when view mode changes
    useEffect(() => {
        setCurrentPage(1)
    }, [viewMode])

    // Calculate pagination based on current view mode AND screen size
    // Desktop always uses grid (pivotedRows), Mobile uses based on viewMode
    const gridTotalPages = Math.ceil(pivotedRows.length / itemsPerPage) || 1;
    const cardTotalPages = Math.ceil(mergedCardsData.length / itemsPerPage) || 1;

    // On desktop: always use grid data
    // On mobile: use card data if viewMode is 'card', otherwise grid data
    const useCardView = isMobile && viewMode === 'card';
    const totalPages = useCardView ? cardTotalPages : gridTotalPages;
    const dataForPagination = useCardView ? mergedCardsData : pivotedRows;

    // Clamp currentPage to valid range (in case it's out of bounds)
    const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    // Ensure currentPage is always within valid range (async update)
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (currentPage < 1) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    // Calculate indices based on validCurrentPage
    const indexOfLastItem = validCurrentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // Slice the correct data source based on view mode
    const visibleRows = pivotedRows.slice(indexOfFirstItem, indexOfLastItem);
    const visibleCards = mergedCardsData.slice(indexOfFirstItem, indexOfLastItem);

    // Toggle issue expand/collapse
    const toggleIssue = (key: string) => {
        setExpandedIssues(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    // Truncate issue text to first word + "..."
    const truncateIssue = (text: string, isExpanded: boolean): string => {
        if (isExpanded || !text) return text;
        const words = text.trim().split(/\s+/);
        if (words.length <= 1) return text;
        return words[0] + '...';
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber)
    }

    // Handle view mode change and reset page to 1
    const handleViewModeChange = (mode: 'grid' | 'card') => {
        setViewMode(mode);
        setCurrentPage(1);
    }

    const [areaList, setAreaList] = useState<any[]>([])
    const [plantList, setPlantList] = useState<any[]>([])
    const [lineList, setLineList] = useState<any[]>([])
    const [processList, setProcessList] = useState<any[]>([])
    const [machineList, setMachineList] = useState<any[]>([])



    // Helper functions for cascading dropdowns
    const loadMachineList = async (areaVal: string, plantVal: string, lineVal: string, processVal: string) => {
        try {
            const result = await getComboData('CBO_MACHINE', {
                condition1: areaVal,
                condition2: plantVal,
                condition3: lineVal,
                condition4: processVal
            });
            if (result?.success && result?.data?.OUT_CURSOR) {
                setMachineList(result.data.OUT_CURSOR);
                if (result.data.OUT_CURSOR.length > 0) {
                    setMachine(result.data.OUT_CURSOR[0].CODE || result.data.OUT_CURSOR[0].NAME || '');
                }
            }
        } catch (err) {
            console.error('Error loading machine list:', err);
        }
    };

    const loadProcessList = async (areaVal: string, plantVal: string, lineVal: string) => {
        try {
            const result = await getComboData('CBO_PROCESS', {
                condition1: areaVal,
                condition2: plantVal,
                condition3: lineVal
            });
            if (result?.success && result?.data?.OUT_CURSOR) {
                setProcessList(result.data.OUT_CURSOR);
                if (result.data.OUT_CURSOR.length > 0) {
                    const val = result.data.OUT_CURSOR[0].CODE || result.data.OUT_CURSOR[0].NAME || '';
                    setProcess(val);
                    if (val) loadMachineList(areaVal, plantVal, lineVal, val);
                }
            }
        } catch (err) {
            console.error('Error loading process list:', err);
        }
    };

    const loadLineList = async (areaVal: string, plantVal: string) => {
        try {
            const result = await getComboData('CBO_LINE', {
                condition1: areaVal,
                condition2: plantVal
            });
            if (result?.success && result?.data?.OUT_CURSOR) {
                setLineList(result.data.OUT_CURSOR);
                if (result.data.OUT_CURSOR.length > 0) {
                    const val = result.data.OUT_CURSOR[0].CODE || result.data.OUT_CURSOR[0].NAME || '';
                    setLine(val);
                    if (val) loadProcessList(areaVal, plantVal, val);
                }
            }
        } catch (err) {
            console.error('Error loading line list:', err);
        }
    };

    const loadPlantList = async (areaVal: string) => {
        try {
            const result = await getComboData('CBO_PLANT', { condition1: areaVal });
            if (result?.success && result?.data?.OUT_CURSOR) {
                setPlantList(result.data.OUT_CURSOR);
                if (result.data.OUT_CURSOR.length > 0) {
                    const val = result.data.OUT_CURSOR[0].CODE || result.data.OUT_CURSOR[0].NAME || '';
                    setPlant(val);
                    if (val) loadLineList(areaVal, val);
                }
            }
        } catch (err) {
            console.error('Error loading plant list:', err);
        }
    };

    // Load Area combo on mount
    useEffect(() => {
        const loadAreaList = async () => {
            try {
                const result = await getComboData('CBO_FAC');
                if (result?.success && result?.data?.OUT_CURSOR) {
                    setAreaList(result.data.OUT_CURSOR);
                    if (result.data.OUT_CURSOR.length > 0) {
                        const val = result.data.OUT_CURSOR[0].CODE || result.data.OUT_CURSOR[0].NAME || '';
                        setArea(val);
                        if (val) loadPlantList(val);
                    }
                }
            } catch (err) {
                console.error('Error loading area list:', err);
            }
        };
        loadAreaList();
    }, []);

    // Load Plant combo when Area changes
    const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setArea(value);
        setPlant('');
        setLine('');
        setProcess('');
        setMachine('');
        setPlantList([]);
        setLineList([]);
        setProcessList([]);
        setMachineList([]);

        if (value) {
            loadPlantList(value);
        }
    };

    // Load Line combo when Plant changes
    const handlePlantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setPlant(value);
        setLine('');
        setProcess('');
        setMachine('');
        setLineList([]);
        setProcessList([]);
        setMachineList([]);

        if (value && area) {
            loadLineList(area, value);
        }
    };

    // Load Process combo when Line changes
    const handleLineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setLine(value);
        setProcess('');
        setMachine('');
        setProcessList([]);
        setMachineList([]);

        if (value && area && plant) {
            loadProcessList(area, plant, value);
        }
    };

    // Load Machine combo when Process changes
    const handleProcessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setProcess(value);
        setMachine('');
        setMachineList([]);

        if (value && area && plant && line) {
            loadMachineList(area, plant, line, value);
        }
    };

    const handleSearch = async () => {
        setIsSearching(true);
        try {
            const result = await getHistoryData({
                qtype: 'Q',
                ymdf: startDate ? format(startDate, 'yyyyMMdd') : '',
                ymdt: endDate ? format(endDate, 'yyyyMMdd') : '',
                fac: area,
                plant: plant,
                line: line,
                opcd: process,
                machine: machine
            });

            if (result?.success && result?.data?.OUT_CURSOR) {
                setHistoryList(result.data.OUT_CURSOR);
            } else {
                setHistoryList([]);
            }
        } catch (err) {
            console.error('Error searching history:', err);
            setHistoryList([]);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="history-container">
            <div className="history-header">
                <h1>{t('history.title')}</h1>
                <p>{t('history.subtitle')}</p>

                <div className="history-filters">
                    <div className="filter-row">
                        <div className="form-group">
                            <label>{t('history.fromDate')}</label>
                            <CustomDatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                placeholder={language === 'vn' ? 'Chọn ngày' : 'Select date'}
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('history.toDate')}</label>
                            <CustomDatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                placeholder={language === 'vn' ? 'Chọn ngày' : 'Select date'}
                            />
                        </div>
                    </div>

                    <div className="filter-row">
                        <div className="form-group">
                            <label>{t('history.area')}</label>
                            <select className="filter-select" value={area} onChange={handleAreaChange}>
                                <option value="" hidden>{t('common.select')}</option>
                                {areaList.length === 0 ? (
                                    <option value="" disabled>{t('common.noOptions')}</option>
                                ) : (
                                    areaList.map((item, index) => (
                                        <option key={index} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('temperature.plant')}</label>
                            <select className="filter-select" value={plant} onChange={handlePlantChange}>
                                <option value="" hidden>{t('common.select')}</option>
                                {plantList.length === 0 ? (
                                    <option value="" disabled>{t('common.noOptions')}</option>
                                ) : (
                                    plantList.map((item, index) => (
                                        <option key={index} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('temperature.line')}</label>
                            <select className="filter-select" value={line} onChange={handleLineChange}>
                                <option value="" hidden>{t('common.select')}</option>
                                {lineList.length === 0 ? (
                                    <option value="" disabled>{t('common.noOptions')}</option>
                                ) : (
                                    lineList.map((item, index) => (
                                        <option key={index} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="filter-row">
                        <div className="form-group">
                            <label>{t('temperature.process')}</label>
                            <select className="filter-select" value={process} onChange={handleProcessChange}>
                                <option value="" hidden>{t('common.select')}</option>
                                {processList.length === 0 ? (
                                    <option value="" disabled>{t('common.noOptions')}</option>
                                ) : (
                                    processList.map((item, index) => (
                                        <option key={index} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('temperature.machine')}</label>
                            <select className="filter-select" value={machine} onChange={(e) => setMachine(e.target.value)}>
                                <option value="" hidden>{t('common.select')}</option>
                                {machineList.length === 0 ? (
                                    <option value="" disabled>{t('common.noOptions')}</option>
                                ) : (
                                    machineList.map((item, index) => (
                                        <option key={index} value={item.CODE || item.NAME}>{item.NAME || item.CODE}</option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div className="form-group filter-button-group">
                            <button className="filter-button" onClick={handleSearch} disabled={isSearching}>
                                {isSearching ? t('common.searching') : t('common.search')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Mode Toggle - Mobile Only (outside table container so it doesn't scroll) */}
            <div className="view-mode-toggle mobile-only">
                <button
                    className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('grid')}
                    title="Grid View"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                    </svg>
                </button>
                <button
                    className={`view-mode-btn ${viewMode === 'card' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('card')}
                    title="Card View"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="8" rx="2" />
                        <rect x="3" y="13" width="18" height="8" rx="2" />
                    </svg>
                </button>
            </div>

            <div className="history-table-container">
                {/* Desktop Table View + Mobile Grid View */}
                <table className={`history-table ${viewMode === 'card' ? 'hide-on-mobile' : ''}`}>
                    <thead>
                        <tr>
                            <th rowSpan={2} style={{ minWidth: '80px', maxWidth: '80px' }}>{t('history.date')}</th>
                            <th rowSpan={2}>{t('history.inspector')}</th>
                            <th rowSpan={2}>{t('history.area')}</th>
                            <th rowSpan={2}>{t('history.machine')}</th>
                            <th rowSpan={2}>{t('history.type')}</th>
                            <th rowSpan={2} style={{ minWidth: '60px' }}>{t('history.lr')}</th>
                            <th colSpan={2} style={{ textAlign: 'center' }}>{t('history.lower')}</th>
                            <th colSpan={2} style={{ textAlign: 'center' }}>{t('history.middle')}</th>
                            <th colSpan={2} style={{ textAlign: 'center' }}>{t('history.upper')}</th>
                        </tr>
                        <tr>
                            {/* Lower Sub-columns */}
                            <th>{t('history.temperature')}</th>
                            {/* <th>{t('history.status')}</th> */}
                            <th>{t('history.issue')}</th>
                            {/* Middle Sub-columns */}
                            <th>{t('history.temperature')}</th>
                            {/* <th>{t('history.status')}</th> */}
                            <th>{t('history.issue')}</th>
                            {/* Upper Sub-columns */}
                            <th>{t('history.temperature')}</th>
                            {/* <th>{t('history.status')}</th> */}
                            <th>{t('history.issue')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pivotedRows.length === 0 ? (
                            <tr>
                                <td colSpan={12} style={{ textAlign: 'center', padding: '20px' }}>{t('history.noData')}</td>
                            </tr>
                        ) : (
                            visibleRows.map((row, idx) => (
                                <tr key={idx}>
                                    {/* First 5 columns with rowSpan for merged groups */}
                                    {row.isFirstInGroup && (
                                        <>
                                            <td rowSpan={row.groupRowCount} className="sticky-col">
                                                <div>{row.YMD ? row.YMD.toString().split(' ')[0] : ''}</div>
                                                <div style={{ color: '#6b7280' }}>
                                                    {row.HMS ? row.HMS : (row.YMD && row.YMD.toString().includes(' ') ? row.YMD.toString().split(' ')[1] : '')}
                                                </div>
                                            </td>
                                            <td rowSpan={row.groupRowCount}>{row.EMP_NM}</td>
                                            <td rowSpan={row.groupRowCount}>{row.CMMS_LOC_NM}</td>
                                            <td rowSpan={row.groupRowCount}>{row.MACH_ID}</td>
                                            <td rowSpan={row.groupRowCount}>{row.MODEL_NM}</td>
                                        </>
                                    )}

                                    {/* Left/Right column - after Type */}
                                    <td>{row.isRow}</td>

                                    {/* Lower - only Temperature, Issue (Status hidden) */}
                                    <td>
                                        {row.lower && <span className="temperature-badge">{row.lower.CHECK_VALUES}</span>}
                                    </td>
                                    {/* Status column hidden
                                    <td>
                                        {row.lower && (
                                            <span className={`status-badge ${row.lower.CHECK_STATUS === 'Pass' ? 'completed' : 'failed'}`}>
                                                {row.lower.CHECK_STATUS}
                                            </span>
                                        )}
                                    </td>
                                    */}
                                    <td
                                        style={{ color: '#DC2626', cursor: row.lower?.ISSUE ? 'pointer' : 'default' }}
                                        onClick={() => row.lower?.ISSUE && toggleIssue(`grid_${idx}_lower`)}
                                        title={row.lower?.ISSUE || ''}
                                    >
                                        {row.lower?.ISSUE ? truncateIssue(row.lower.ISSUE, expandedIssues.has(`grid_${idx}_lower`)) : ''}
                                    </td>

                                    {/* Middle - only Temperature, Issue (Status hidden) */}
                                    <td>
                                        {row.middle && <span className="temperature-badge">{row.middle.CHECK_VALUES}</span>}
                                    </td>
                                    {/* Status column hidden
                                    <td>
                                        {row.middle && (
                                            <span className={`status-badge ${row.middle.CHECK_STATUS === 'Pass' ? 'completed' : 'failed'}`}>
                                                {row.middle.CHECK_STATUS}
                                            </span>
                                        )}
                                    </td>
                                    */}
                                    <td
                                        style={{ color: '#DC2626', cursor: row.middle?.ISSUE ? 'pointer' : 'default' }}
                                        onClick={() => row.middle?.ISSUE && toggleIssue(`grid_${idx}_middle`)}
                                        title={row.middle?.ISSUE || ''}
                                    >
                                        {row.middle?.ISSUE ? truncateIssue(row.middle.ISSUE, expandedIssues.has(`grid_${idx}_middle`)) : ''}
                                    </td>

                                    {/* Upper - only Temperature, Issue (Status hidden) */}
                                    <td>
                                        {row.upper && <span className="temperature-badge">{row.upper.CHECK_VALUES}</span>}
                                    </td>
                                    {/* Status column hidden
                                    <td>
                                        {row.upper && (
                                            <span className={`status-badge ${row.upper.CHECK_STATUS === 'Pass' ? 'completed' : 'failed'}`}>
                                                {row.upper.CHECK_STATUS}
                                            </span>
                                        )}
                                    </td>
                                    */}
                                    <td
                                        style={{ color: '#DC2626', cursor: row.upper?.ISSUE ? 'pointer' : 'default' }}
                                        onClick={() => row.upper?.ISSUE && toggleIssue(`grid_${idx}_upper`)}
                                        title={row.upper?.ISSUE || ''}
                                    >
                                        {row.upper?.ISSUE ? truncateIssue(row.upper.ISSUE, expandedIssues.has(`grid_${idx}_upper`)) : ''}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {/* Mobile Card View - Using merged data (visibleCards) */}
                {viewMode === 'card' && (
                    <div className="mobile-cards mobile-only">
                        {visibleCards.length === 0 ? (
                            <div className="no-data-card">{t('history.noData')}</div>
                        ) : (
                            visibleCards.map((card, index) => (
                                <div className="history-card-new" key={index}>
                                    {/* Card Header - Inspector & DateTime */}
                                    <div className="card-header-new">
                                        <div className="card-avatar">
                                            {card.EMP_NM?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'NA'}
                                        </div>
                                        <div className="card-header-info">
                                            <div className="card-inspector-name">{card.EMP_NM}</div>
                                            <div className="card-datetime">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <polyline points="12,6 12,12 16,14" />
                                                </svg>
                                                {card.YMD ? card.YMD.toString().split(' ')[0] : ''} • {card.HMS || ''}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Body - Area & Machine */}
                                    <div className="card-body-new">
                                        <div className="card-info-row">
                                            <div className="card-info-item">
                                                <span className="card-label">{t('history.area')}</span>
                                                <span className="card-value">{card.CMMS_LOC_NM}</span>
                                            </div>
                                            <div className="card-info-item">
                                                <span className="card-label">{t('history.machine')}</span>
                                                <span className="card-value">{card.MACH_ID}</span>
                                            </div>
                                        </div>
                                        <div className="card-info-row">
                                            <div className="card-info-item full-width">
                                                <span className="card-label">{t('history.type')}</span>
                                                <span className="card-value type-value">{card.MODEL_NM}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer - Temperature Data (Left & Right horizontal inline) */}
                                    <div className="card-temps-section">
                                        {/* Lower */}
                                        {(card.lowerLeft || card.lowerRight) && (
                                            <div className="card-temp-position-inline">
                                                <div className="temp-position-header">{t('history.lower')}</div>
                                                <div className="temp-inline-row">
                                                    {card.lowerLeft && (
                                                        <span className="temp-inline-item">
                                                            <span className="temp-inline-label">{t('history.left')}:</span>
                                                            <span className={`temp-inline-value ${card.lowerLeft.CHECK_STATUS === 'Pass' ? 'pass' : 'fail'}`}>{card.lowerLeft.CHECK_VALUES}°C</span>
                                                            <span className={`temp-inline-status ${card.lowerLeft.CHECK_STATUS === 'Pass' ? 'pass' : 'fail'}`}>
                                                                {card.lowerLeft.CHECK_STATUS}
                                                            </span>
                                                        </span>
                                                    )}
                                                    {card.lowerLeft && card.lowerRight && <span className="temp-inline-divider">|</span>}
                                                    {card.lowerRight && (
                                                        <span className="temp-inline-item">
                                                            <span className="temp-inline-label">{t('history.right')}:</span>
                                                            <span className={`temp-inline-value ${card.lowerRight.CHECK_STATUS === 'Pass' ? 'pass' : 'fail'}`}>{card.lowerRight.CHECK_VALUES}°C</span>
                                                            <span className={`temp-inline-status ${card.lowerRight.CHECK_STATUS === 'Pass' ? 'pass' : 'fail'}`}>
                                                                {card.lowerRight.CHECK_STATUS}
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                                {(card.lowerLeft?.ISSUE || card.lowerRight?.ISSUE) && (
                                                    <div className="temp-inline-issues">
                                                        {card.lowerLeft?.ISSUE && (
                                                            <span
                                                                className={`temp-issue ${expandedIssues.has(`${index}_lower_left`) ? 'expanded' : ''}`}
                                                                onClick={() => toggleIssue(`${index}_lower_left`)}
                                                                title={card.lowerLeft.ISSUE}
                                                            >
                                                                {truncateIssue(card.lowerLeft.ISSUE, expandedIssues.has(`${index}_lower_left`))}
                                                            </span>
                                                        )}
                                                        {card.lowerLeft?.ISSUE && card.lowerRight?.ISSUE && <span className="temp-inline-divider">|</span>}
                                                        {card.lowerRight?.ISSUE && (
                                                            <span
                                                                className={`temp-issue ${expandedIssues.has(`${index}_lower_right`) ? 'expanded' : ''}`}
                                                                onClick={() => toggleIssue(`${index}_lower_right`)}
                                                                title={card.lowerRight.ISSUE}
                                                            >
                                                                {truncateIssue(card.lowerRight.ISSUE, expandedIssues.has(`${index}_lower_right`))}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Middle */}
                                        {(card.middleLeft || card.middleRight) && (
                                            <div className="card-temp-position-inline">
                                                <div className="temp-position-header">{t('history.middle')}</div>
                                                <div className="temp-inline-row">
                                                    {card.middleLeft && (
                                                        <span className="temp-inline-item">
                                                            <span className="temp-inline-label">{t('history.left')}:</span>
                                                            <span className={`temp-inline-value ${card.middleLeft.CHECK_STATUS === 'Pass' ? 'pass' : 'fail'}`}>{card.middleLeft.CHECK_VALUES}°C</span>
                                                            <span className={`temp-inline-status ${card.middleLeft.CHECK_STATUS === 'Pass' ? 'pass' : 'fail'}`}>
                                                                {card.middleLeft.CHECK_STATUS}
                                                            </span>
                                                        </span>
                                                    )}
                                                    {card.middleLeft && card.middleRight && <span className="temp-inline-divider">|</span>}
                                                    {card.middleRight && (
                                                        <span className="temp-inline-item">
                                                            <span className="temp-inline-label">{t('history.right')}:</span>
                                                            <span className={`temp-inline-value ${card.middleRight.CHECK_STATUS === 'Pass' ? 'pass' : 'fail'}`}>{card.middleRight.CHECK_VALUES}°C</span>
                                                            <span className={`temp-inline-status ${card.middleRight.CHECK_STATUS === 'Pass' ? 'pass' : 'fail'}`}>
                                                                {card.middleRight.CHECK_STATUS}
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                                {(card.middleLeft?.ISSUE || card.middleRight?.ISSUE) && (
                                                    <div className="temp-inline-issues">
                                                        {card.middleLeft?.ISSUE && (
                                                            <span
                                                                className={`temp-issue ${expandedIssues.has(`${index}_middle_left`) ? 'expanded' : ''}`}
                                                                onClick={() => toggleIssue(`${index}_middle_left`)}
                                                                title={card.middleLeft.ISSUE}
                                                            >
                                                                {truncateIssue(card.middleLeft.ISSUE, expandedIssues.has(`${index}_middle_left`))}
                                                            </span>
                                                        )}
                                                        {card.middleLeft?.ISSUE && card.middleRight?.ISSUE && <span className="temp-inline-divider">|</span>}
                                                        {card.middleRight?.ISSUE && (
                                                            <span
                                                                className={`temp-issue ${expandedIssues.has(`${index}_middle_right`) ? 'expanded' : ''}`}
                                                                onClick={() => toggleIssue(`${index}_middle_right`)}
                                                                title={card.middleRight.ISSUE}
                                                            >
                                                                {truncateIssue(card.middleRight.ISSUE, expandedIssues.has(`${index}_middle_right`))}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Upper */}
                                        {(card.upperLeft || card.upperRight) && (
                                            <div className="card-temp-position-inline">
                                                <div className="temp-position-header">{t('history.upper')}</div>
                                                <div className="temp-inline-row">
                                                    {card.upperLeft && (
                                                        <span className="temp-inline-item">
                                                            <span className="temp-inline-label">{t('history.left')}:</span>
                                                            <span className={`temp-inline-value ${card.upperLeft.CHECK_STATUS === 'Pass' ? 'pass' : 'fail'}`}>{card.upperLeft.CHECK_VALUES}°C</span>
                                                            <span className={`temp-inline-status ${card.upperLeft.CHECK_STATUS === 'Pass' ? 'pass' : 'fail'}`}>
                                                                {card.upperLeft.CHECK_STATUS}
                                                            </span>
                                                        </span>
                                                    )}
                                                    {card.upperLeft && card.upperRight && <span className="temp-inline-divider">|</span>}
                                                    {card.upperRight && (
                                                        <span className="temp-inline-item">
                                                            <span className="temp-inline-label">{t('history.right')}:</span>
                                                            <span className={`temp-inline-value ${card.upperRight.CHECK_STATUS === 'Pass' ? 'pass' : 'fail'}`}>{card.upperRight.CHECK_VALUES}°C</span>
                                                            <span className={`temp-inline-status ${card.upperRight.CHECK_STATUS === 'Pass' ? 'pass' : 'fail'}`}>
                                                                {card.upperRight.CHECK_STATUS}
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                                {(card.upperLeft?.ISSUE || card.upperRight?.ISSUE) && (
                                                    <div className="temp-inline-issues">
                                                        {card.upperLeft?.ISSUE && (
                                                            <span
                                                                className={`temp-issue ${expandedIssues.has(`${index}_upper_left`) ? 'expanded' : ''}`}
                                                                onClick={() => toggleIssue(`${index}_upper_left`)}
                                                                title={card.upperLeft.ISSUE}
                                                            >
                                                                {truncateIssue(card.upperLeft.ISSUE, expandedIssues.has(`${index}_upper_left`))}
                                                            </span>
                                                        )}
                                                        {card.upperLeft?.ISSUE && card.upperRight?.ISSUE && <span className="temp-inline-divider">|</span>}
                                                        {card.upperRight?.ISSUE && (
                                                            <span
                                                                className={`temp-issue ${expandedIssues.has(`${index}_upper_right`) ? 'expanded' : ''}`}
                                                                onClick={() => toggleIssue(`${index}_upper_right`)}
                                                                title={card.upperRight.ISSUE}
                                                            >
                                                                {truncateIssue(card.upperRight.ISSUE, expandedIssues.has(`${index}_upper_right`))}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

            </div>

            {/* Pagination Controls */}
            {
                dataForPagination.length > 0 && (
                    <div className="pagination-container">
                        <div className="pagination-info">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, dataForPagination.length)} of {dataForPagination.length} entries
                        </div>
                        <div className="pagination-controls">
                            {/* First Page */}
                            <button
                                className="pagination-button"
                                onClick={() => handlePageChange(1)}
                                disabled={validCurrentPage === 1}
                                title={t('common.firstPage') || 'First Page'}
                            >
                                &laquo;
                            </button>
                            {/* Previous Page */}
                            <button
                                className="pagination-button"
                                onClick={() => handlePageChange(validCurrentPage - 1)}
                                disabled={validCurrentPage === 1}
                                title={t('common.prevPage') || 'Previous Page'}
                            >
                                &lt;
                            </button>

                            {/* Page Numbers */}
                            {(() => {
                                const maxPagesToShow = 3;
                                let startPage = Math.max(1, validCurrentPage - Math.floor(maxPagesToShow / 2));
                                let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

                                if (endPage - startPage + 1 < maxPagesToShow) {
                                    startPage = Math.max(1, endPage - maxPagesToShow + 1);
                                }

                                return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                                    <button
                                        key={page}
                                        className={`pagination-button ${validCurrentPage === page ? 'active' : ''}`}
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </button>
                                ));
                            })()}

                            {/* Next Page */}
                            <button
                                className="pagination-button"
                                onClick={() => handlePageChange(validCurrentPage + 1)}
                                disabled={validCurrentPage === totalPages}
                                title={t('common.nextPage') || 'Next Page'}
                            >
                                &gt;
                            </button>
                            {/* Last Page */}
                            <button
                                className="pagination-button"
                                onClick={() => handlePageChange(totalPages)}
                                disabled={validCurrentPage === totalPages}
                                title={t('common.lastPage') || 'Last Page'}
                            >
                                &raquo;
                            </button>

                            {/* Go to Page Input */}
                            <div className="pagination-input-group">
                                <input
                                    type="number"
                                    min="1"
                                    max={totalPages}
                                    className="pagination-input"
                                    placeholder="Go to"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = parseInt(e.currentTarget.value);
                                            if (!isNaN(val) && val >= 1 && val <= totalPages) {
                                                handlePageChange(val);
                                                e.currentTarget.value = ''; // Optional: clear after go
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}

export default History
