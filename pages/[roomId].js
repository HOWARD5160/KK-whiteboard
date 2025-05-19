import dynamic from 'next/dynamic';
const Whiteboard = dynamic(() => import('../components/Whiteboard'), { ssr: false });
export default function RoomPage() {
  return <Whiteboard />;
}
