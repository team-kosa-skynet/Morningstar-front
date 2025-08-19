import { useEffect } from 'react';
import styles from './PaymentSuccess.module.scss';

function PaymentSuccess() {
    useEffect(() => {
        // 결제 완료 후 바로 홈으로 완전한 URL 리다이렉트
        window.location.replace(window.location.origin + '/#/');
    }, []);

    return (
        <div className={styles.container}>
        </div>
    );
}

export default PaymentSuccess;