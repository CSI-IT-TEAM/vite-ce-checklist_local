import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEmployeeInfo } from '../../api'
import './Login.css'

const LoginLocal = () => {
    const navigate = useNavigate()
    const [cardNumber, setCardNumber] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [validationError, setValidationError] = useState('')
    const [error, setError] = useState('')
    const [isPending, setIsPending] = useState(false)

    // Load dữ liệu từ localStorage khi component mount
    useEffect(() => {
        const savedCardNumber = localStorage.getItem('cardNumber')
        const savedRememberMe = localStorage.getItem('rememberMe')

        if (savedCardNumber) {
            setCardNumber(savedCardNumber)
        }
        if (savedRememberMe) {
            setRememberMe(JSON.parse(savedRememberMe))
        }
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setValidationError('')
        setError('')

        // Blur input trước khi submit để đóng bàn phím
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur()
        }

        // Validation check
        if (!cardNumber || cardNumber.trim() === '') {
            setValidationError('Vui lòng nhập số thẻ')
            return
        }

        setIsPending(true)

        try {
            // Sử dụng API function từ thư mục api
            const result = await getEmployeeInfo(cardNumber)

            // Server trả về lỗi
            if (!result.success) {
                setError(result.message || "Đăng nhập thất bại.")
                setIsPending(false)
                return
            }

            // Kiểm tra xem có dữ liệu employee không
            const employees = result.data?.OUT_CURSOR
            if (!employees || employees.length === 0) {
                setError("Không tìm thấy thông tin nhân viên.")
                setIsPending(false)
                return
            }

            const employeeData = employees[0]

            // Đăng nhập thành công
            // Lưu cardNumber nếu Remember me được chọn
            if (rememberMe) {
                localStorage.setItem('cardNumber', cardNumber)
                localStorage.setItem('rememberMe', JSON.stringify(true))
            } else {
                localStorage.removeItem('cardNumber')
                localStorage.removeItem('rememberMe')
            }

            // Lưu user data vào localStorage
            const userData = {
                userID: employeeData.EMP_ID,
                userName: employeeData.EMP_NAME,
                nameEng: employeeData.NAME_ENG,
                dept: employeeData.DEPT,
                deptName: employeeData.DEPT_NM,
                jobCode: employeeData.JOBCD,
                jobName: employeeData.JOBCD_NM,
                position: employeeData.JOB_POSITION,
                positionName: employeeData.JOB_POSITION_NM,
                phone: employeeData.PHONE,
                email: employeeData.EMAIL,
                photo: employeeData.PHOTO_URL || employeeData.PHOTO,
                ipAddress: employeeData.IP_ADDRESS,
                company: employeeData.COMPANY,
                serviceId: employeeData.SERVICE_ID
            }

            localStorage.setItem('userData', JSON.stringify(userData))

            // Blur input để đóng bàn phím trước khi navigate (fix iOS viewport issue)
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur()
            }

            // Scroll lên đầu trang
            window.scrollTo(0, 0)

            // Delay một chút để iOS có thời gian reset viewport
            setTimeout(() => {
                navigate('/')
            }, 100)

        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-header">
                <h1>Chào Mừng Trở Lại</h1>
                <p>Nhập thông tin đăng nhập của bạn để truy cập tài khoản của bạn</p>
            </div>

            <div className="login-card">
                <img
                    src="/images/checklist2.jpg"
                    alt="Login illustration"
                    className="login-illustration"
                />

                <div className="login-card-header">
                    <h2>Đăng Nhập</h2>
                    <p>Đăng nhập vào tài khoản của bạn để tiếp tục</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="cardNumber">Số Thẻ</label>
                        <input
                            type="tel"
                            id="cardNumber"
                            pattern="[0-9]*"
                            enterKeyHint="go"
                            value={cardNumber}
                            onChange={(e) => {
                                // Chỉ cho phép nhập số 0-9
                                const value = e.target.value.replace(/[^0-9]/g, '')
                                setCardNumber(value)
                                if (validationError) setValidationError('')
                                if (error) setError('')
                            }}
                            onKeyDown={(e) => {
                                // Chặn các phím không phải số (ngoại trừ Backspace, Delete, Tab, Arrow keys, Enter)
                                const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter']
                                if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                                    e.preventDefault()
                                }
                            }}
                            placeholder="Nhập số thẻ"
                            disabled={isPending}
                            autoComplete="off"
                        />
                    </div>

                    <div className="remember-me">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            disabled={isPending}
                        />
                        <label htmlFor="rememberMe">Remember me</label>
                    </div>

                    {validationError && (
                        <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
                            {validationError}
                        </div>
                    )}

                    {error && !validationError && (
                        <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
                            Đăng nhập thất bại. {error}
                        </div>
                    )}

                    <button type="submit" className="login-button" disabled={isPending}>
                        {isPending ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LoginLocal
