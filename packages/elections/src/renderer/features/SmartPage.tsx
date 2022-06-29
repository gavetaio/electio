// @ts-ignore
import { Page } from '@gavetaio/ui';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLayoutContext } from 'renderer/context/layout';

const SmartPage = ({ children }) => {
  const rendered = useRef(false);
  const location = useLocation();
  const { saveLayout, getLayout }: any = useLayoutContext();
  const navigate = useNavigate();
  const layout = getLayout();

  useEffect(() => {
    rendered.current = true;
    if (layout?.saved?.latest && layout.saved.latest !== location.pathname) {
      navigate(layout.saved.latest);
    }
  }, []);

  useEffect(() => {
    if (!rendered.current) {
      return;
    }
    if (layout?.saved?.latest && layout.saved.latest !== location.pathname) {
      saveLayout({
        latest: location.pathname,
      });
    }
  }, [location]);

  return <Page>{children}</Page>;
};

export default SmartPage;
