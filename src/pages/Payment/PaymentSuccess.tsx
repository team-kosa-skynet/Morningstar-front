import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        // 결제 완료 후 홈으로 리다이렉트 (모달 표시를 위해 쿼리 파라미터 추가)
        navigate('/?donation=success');
    }, [navigate]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '24px',
            color: '#333',
            backgroundColor: '#f5f5f5'
        }}>
            <h1>결제가 완료되었습니다. 잠시 후 홈으로 이동합니다...</h1>
        </div>
    );
}

export default PaymentSuccess;