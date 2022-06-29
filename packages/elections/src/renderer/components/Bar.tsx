import { useState, useContext } from 'react';
import { LayoutContext } from 'renderer/context/layout';
import { useNavigate, useLocation } from 'react-router';
import { Wrapper } from '@gavetaio/ui';
import styles from './Bar.module.scss';

const Bar = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { setLayout }: any = useContext(LayoutContext);

  const handleKeyDown = (event: any) => {
    if (event.keyCode === 13) {
      handleSearch();
    }
  };

  const handleSearch = () => {
    setLayout({ search });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      <Wrapper>
        <div className={styles.wrapper}>
          <button type="button" onClick={handleBack}>
            Voltar
          </button>
          <div className={styles.input}>
            <div className={styles.path}>
              <h6>{location.pathname}</h6>
            </div>
            <input
              disabled
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button disabled type="button" onClick={handleSearch}>
            Buscar
          </button>
        </div>
      </Wrapper>
    </div>
  );
};

export default Bar;
