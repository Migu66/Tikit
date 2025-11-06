import NotFoundContent from '@/components/not-found/not-found-content';

export const metadata = {
  title: '404 - Página no encontrada | Tikit',
  description: 'La página que buscas no existe',
};

export default function NotFound() {
  return <NotFoundContent />;
}
