import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'

type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
    mode: ThemeMode
    toggleTheme: () => void
    isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useThemeMode = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useThemeMode must be used within a ThemeProvider')
    }
    return context
}

interface ThemeProviderProps {
    children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [mode, setMode] = useState<ThemeMode>(() => {
        const savedMode = localStorage.getItem('themeMode') as ThemeMode
        return savedMode || 'light'
    })

    useEffect(() => {
        localStorage.setItem('themeMode', mode)
        document.body.classList.remove('light-mode', 'dark-mode')
        document.body.classList.add(`${mode}-mode`)
    }, [mode])

    const toggleTheme = () => {
        setMode(prev => prev === 'light' ? 'dark' : 'light')
    }

    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            ...(mode === 'light' ? {
                // Light mode colors
                primary: {
                    main: '#1565c0',
                    light: '#1e88e5',
                    dark: '#0d47a1'
                },
                secondary: {
                    main: '#6a11cb'
                },
                background: {
                    default: '#f5f7fa',
                    paper: '#ffffff'
                },
                text: {
                    primary: '#1a1a1a',
                    secondary: '#666666'
                },
                divider: 'rgba(0, 0, 0, 0.12)'
            } : {
                // Dark mode colors
                primary: {
                    main: '#64b5f6',
                    light: '#90caf9',
                    dark: '#42a5f5'
                },
                secondary: {
                    main: '#bb86fc'
                },
                background: {
                    default: '#0a1929',
                    paper: '#132f4c'
                },
                text: {
                    primary: '#ffffff',
                    secondary: '#b0bec5'
                },
                divider: 'rgba(255, 255, 255, 0.12)'
            })
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: mode === 'light' ? '#f5f7fa' : '#0a1929',
                        transition: 'background-color 0.3s ease'
                    }
                }
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
                    }
                }
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: mode === 'light' ? undefined : '#132f4c',
                        boxShadow: mode === 'light'
                            ? '0 2px 10px rgba(21, 101, 192, 0.3)'
                            : '0 2px 10px rgba(0, 0, 0, 0.5)'
                    }
                }
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundColor: mode === 'light' ? '#ffffff' : '#132f4c',
                        borderRight: mode === 'light' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)'
                    }
                }
            },
            MuiBottomNavigation: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'light' ? '#ffffff' : '#132f4c'
                    }
                }
            },
            MuiBottomNavigationAction: {
                styleOverrides: {
                    root: {
                        color: mode === 'light' ? '#666666' : '#b0bec5',
                        '&.Mui-selected': {
                            color: mode === 'light' ? '#1565c0' : '#64b5f6'
                        }
                    }
                }
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        borderBottomColor: mode === 'light' ? 'rgba(224, 224, 224, 0.5)' : 'rgba(255, 255, 255, 0.08)',
                        borderRightColor: mode === 'light' ? 'rgba(224, 224, 224, 0.5)' : 'rgba(255, 255, 255, 0.08)'
                    },
                    head: {
                        backgroundColor: mode === 'light' ? '#1565c0' : '#1e3a5f',
                        color: '#ffffff',
                        borderRightColor: 'rgba(255, 255, 255, 0.2)'
                    }
                }
            },
            MuiTableRow: {
                styleOverrides: {
                    root: {
                        '&:hover': {
                            backgroundColor: mode === 'light'
                                ? 'rgba(21, 101, 192, 0.04)'
                                : 'rgba(100, 181, 246, 0.08)'
                        }
                    }
                }
            },
            MuiInputBase: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'light' ? '#ffffff' : '#1e3a5f',
                        '&.Mui-disabled': {
                            backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                }
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)'
                        }
                    }
                }
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        color: mode === 'light' ? '#666666' : '#b0bec5'
                    }
                }
            },
            MuiButton: {
                styleOverrides: {
                    contained: {
                        boxShadow: mode === 'light'
                            ? '0 2px 8px rgba(21, 101, 192, 0.3)'
                            : '0 2px 8px rgba(0, 0, 0, 0.5)'
                    }
                }
            },
            MuiFab: {
                styleOverrides: {
                    root: {
                        boxShadow: mode === 'light'
                            ? '0 4px 16px rgba(106, 17, 203, 0.4)'
                            : '0 4px 16px rgba(0, 0, 0, 0.6)'
                    }
                }
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'light' ? '#ffffff' : '#132f4c'
                    }
                }
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'light' ? undefined : 'rgba(100, 181, 246, 0.15)'
                    }
                }
            },
            MuiMenu: {
                styleOverrides: {
                    paper: {
                        backgroundColor: mode === 'light' ? '#ffffff' : '#1e3a5f'
                    }
                }
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        '&:hover': {
                            backgroundColor: mode === 'light'
                                ? 'rgba(0, 0, 0, 0.04)'
                                : 'rgba(255, 255, 255, 0.08)'
                        }
                    }
                }
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        backgroundColor: mode === 'light' ? '#ffffff' : '#132f4c'
                    }
                }
            }
        }
    }), [mode])

    const value = {
        mode,
        toggleTheme,
        isDark: mode === 'dark'
    }

    return (
        <ThemeContext.Provider value={value}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    )
}

export default ThemeProvider
