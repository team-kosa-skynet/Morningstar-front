import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PaymentSuccess.module.scss';

function PaymentSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        // 결제 완료 상태를 sessionStorage에 저장
        sessionStorage.setItem('paymentSuccess', 'true');
        // 결제 완료 후 바로 홈으로 리다이렉트
        navigate('/');
    }, [navigate]);

    return (
        <div className={styles.container}>
        </div>
    );
}

export default PaymentSuccess;