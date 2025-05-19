import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/room/kk'); // 默认跳转到名为 kk 的白板房间
  }, []);

  return <div>正在进入 KK 协作白板...</div>;
}
