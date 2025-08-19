import { useEffect } from 'react';
import styles from './PaymentSuccess.module.scss';

function PaymentSuccess() {
    useEffect(() => {
        // 부모 창에 결제 완료 메시지 전달
        if (window.opener) {
            window.opener.postMessage({ type: 'PAYMENT_SUCCESS' }, '*');
        }
        window.close();
    }, []);

    return (
        <div className={styles.container}>
        </div>
    );
}

export default PaymentSuccess;