/* eslint-disable import/prefer-default-export */
import { useCallback } from 'react';
import {
  useParams,
  useNavigate,
  useResolvedPath,
  useLocation,
} from 'react-router-dom';

const scrollTop = () => {
  const el = document.querySelector('html');
  el.scrollTo({
    top: 0,
  });
};

export const useNavigation = () => {
  const { pathname: url } = useLocation();

  const history = useNavigate();

  const navigate = useCallback(
    (to, params = null) => {
      if (params?.event) {
        params.event.preventDefault();
      }

      if (to.match(/^\//gim)) {
        scrollTop();
        history(to);
        return;
      }
      scrollTop();
      history(`${url}/${to}`);
    },
    [history, url]
  );

  const getRoute = useCallback(() => {
    return url;
  }, [url]);

  return {
    navigate,
    getRoute,
  };
};
