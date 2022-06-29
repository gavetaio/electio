import { Table, Button } from '@gavetaio/ui';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  DesktopDownloadIcon,
  TrashIcon,
  DownloadIcon,
} from '@primer/octicons-react';
import Dropzone from 'react-dropzone';
import _ from 'lodash';
import styles from './Dropper.module.scss';

const Dropper = ({ setLoader, archived, refreshList }: any) => {
  const [active, setActive] = useState(false);
  const [files, setFiles] = useState([]);
  const containerClass = [styles.container];
  // @ts-ignore
  const { elections, unzipFile } = window.electron;
  const clearLoaderTimer: any = useRef(null);
  const shouldLoadNext: any = useRef(false);
  const loadAllTimer: any = useRef(null);

  if (active) {
    containerClass.push(styles.active);
  }

  const saveStatus = useCallback(
    (data: any) => {
      const row = [];

      if (data.emoji) {
        row.push(data.emoji);
      }
      if (typeof data.print === 'string') {
        row.push(data.print);
      } else {
        row.push(...data.print);
      }

      setLoader({
        visible: true,
        title: 'Processando os dados ..',
        text: row.join(' '),
      });
    },
    [setLoader]
  );

  const handleElectionsLog = (data: any) => {
    saveStatus(data);
  };

  const clearLoader = (timeout = 500) => {
    clearLoaderTimer.current = setTimeout(() => {
      setLoader({
        visible: false,
      });
    }, timeout);
  };

  const clearSection = (section: string) => {
    const filtered = files.filter((file) => file.section !== section);
    setFiles(filtered);
  };

  const loadNext = () => {
    const element: any = document.querySelector('.file-loader');
    if (element) {
      element.click();
      return;
    }
    clearTimeout(loadAllTimer.current);
    loadAllTimer.current = null;
    shouldLoadNext.current = false;
  };

  const handleElectionsDone = ({ success, section }) => {
    clearSection(section);
    refreshList();
    clearLoader(2000);

    if (shouldLoadNext.current) {
      loadAllTimer.current = setTimeout(loadNext, 3000);
    }
  };

  const handleUnzipDone = ({ section, files }: any) => {
    if (!files?.length) {
      clearLoader();
      return;
    }
    elections.run({ section, files });
  };

  useEffect(() => {
    elections.off('elections-log');
    elections.off('elections-done');
    elections.off('unzip-done');
    elections.on('elections-log', handleElectionsLog);
    elections.on('elections-done', handleElectionsDone);
    elections.on('unzip-done', handleUnzipDone);
  }, [elections, handleElectionsLog, handleElectionsDone, handleUnzipDone]);

  useEffect(() => {
    return () => {
      if (clearLoaderTimer?.current) {
        clearTimeout(clearLoaderTimer.current);
      }
      if (elections) {
        elections.off('elections-log');
        elections.off('elections-done');
        elections.off('unzip-done');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragEnter = () => {
    setActive(true);
  };

  const handleDragLeave = () => {
    setActive(false);
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const runFiles = async (section: any, toLoad: any) => {
    setLoader({
      visible: true,
      title: 'Descompactando arquivos',
      text: '...',
      section,
    });
    const paths = [];

    for (let i = 0; i < toLoad.length; i += 1) {
      if (toLoad[i]?.path) {
        paths.push(toLoad[i].path);
      }
    }

    unzipFile({ section, files: paths });
  };

  const getInfoFromAccepted = (file: any) => {
    const { name } = file;

    if (
      !name.match(
        /(vsec_[0-9]{1}t_[a-z]{2}|consulta_colig|consulta_cand|cesp|votacao_secao_[0-9]{4}_[a-z]{2})|(bweb_[0-9]{1}t_[a-z]{2}_)/gim
      )
    ) {
      return null;
    }

    if (name.match(/^vsec_[0-9]{1}t_[a-z]{2}/gim)) {
      const year = '2012';
      const uf = name.replace(/vsec_[0-9]{1}t_([a-z]{2}).*/gim, '$1');
      const turno = name.replace(/vsec_([0-9]{1}t_)[a-z]{2}/gim, '$1');

      return {
        ...file,
        year,
        uf,
        turno,
        id: `${uf}-${year}-${turno}`,
        section: `${uf}-${year}`,
      };
    }

    if (name.match(/^bweb_[0-9]{1}t_[a-z]{2}_/gim)) {
      const year = name.replace(
        /bweb_[0-9]{1}t_[a-z]{2}_[0-9]{4}(20[0-9]{2}).*/gim,
        '$1'
      );
      const uf = name.replace(/bweb_[0-9]{1}t_([a-z]{2})_.*/gim, '$1');
      const turno = name.replace(/bweb_([0-9]{1})t_[a-z]{2}_.*/gim, '$1');

      return {
        ...file,
        year,
        uf,
        turno,
        id: `${uf}-${year}-${turno}`,
        section: `${uf}-${year}`,
      };
    }

    if (name.match(/(^cesp)/gim)) {
      const year = name.replace(
        /^cesp_[0-9]{1}t_[a-z]{2}_[0-9]{4}(20[0-9]{2}).*/gim,
        '$1'
      );
      //
      const uf = name.replace(
        /^cesp_[0-9]{1}t_([a-z]{2})_[0-9]{4}20[0-9]{2}.*/gim,
        '$1'
      );
      //
      const turno = name.replace(
        /^cesp_([0-9]{1}t)_[a-z]{2}_[0-9]{4}20[0-9]{2}.*/gim,
        '$1'
      );

      return {
        ...file,
        year,
        uf,
        turno,
        id: `CESP-${uf}-${year}-${turno}`,
        section: `${uf}-${year}`,
      };
    }

    if (name.match(/(^consulta_cand)/gim)) {
      const year = name.replace(/.*([0-9]{4}).*/gim, '$1');
      const turno = '1t_2t';

      return {
        ...file,
        year,
        turno,
        id: `CANDIDATOS-${year}-${turno}`,
        section: `CANDIDATOS-${year}-${turno}`,
      };
    }

    if (name.match(/(^consulta_colig)/gim)) {
      const year = name.replace(/.*([0-9]{4}).*/gim, '$1');
      const turno = '1t_2t';

      return {
        ...file,
        year,
        turno,
        id: `COLIGACOES-${year}-${turno}`,
        section: `COLIGACOES-${year}-${turno}`,
      };
    }

    if (name.match(/(^votacao_secao)/gim)) {
      const year = name.replace(
        /^votacao_secao_([0-9]{4})_[a-z]{2}.*/gim,
        '$1'
      );
      const uf = name.replace(/^votacao_secao_[0-9]{4}_([a-z]{2}).*/gim, '$1');
      const turno = '1t_2t';

      return {
        ...file,
        year,
        uf,
        turno,
        id: `${uf}-${year}`,
        section: `${uf}-${year}`,
      };
    }

    return null;
  };

  const pushFiles = (loaded: any) => {
    if (!loaded?.length) {
      return;
    }

    const current = [...files];

    loaded.forEach((file: any) => {
      if (!file) {
        return;
      }
      const index = _.findIndex(current, { section: file.section });

      if (index !== -1) {
        const { files } = current[index];
        const idx = _.findIndex(files, { id: file.id });

        if (idx !== -1) {
          current[index].files[idx] = file;
          return;
        }
        current[index].files.push(file);
        return;
      }

      current.push({
        section: file.section,
        files: [file],
      });
    });
    //

    setFiles(current);
  };

  const handleDrop = async (acceptedFiles: any) => {
    if (acceptedFiles?.length) {
      const loaded: any = [];

      acceptedFiles.forEach(({ name, size, path, type }: any) => {
        const info = getInfoFromAccepted({ name, size, path, type });
        if (!info) {
          return;
        }

        loaded.push(info);
      });

      pushFiles(loaded);
    }
  };

  const handleLoadAll = () => {
    shouldLoadNext.current = true;
    loadNext();
  };

  const renderControls = () => {
    return (
      <footer className={styles.footer}>
        <Button onClick={handleLoadAll}>Carregar Todos</Button>
        <Button type="danger" onClick={clearFiles}>
          Limpar Lista
        </Button>
      </footer>
    );
  };

  const renderFiles = () => {
    if (!files?.length) {
      return null;
    }

    const header = ['Referência', 'Arquivos', 'Status', 'Ações'];

    const presidents = files.filter((file: any) => {
      return !!file.section.match(/BR/gim);
    });

    const candidatos = files.filter((file: any) => {
      return !!file.section.match(/cand/gim);
    });

    const coligacoes = files.filter((file: any) => {
      return !!file.section.match(/colig/gim);
    });

    const data = files.map((file: any) => {
      let loaded = false;
      const { section } = file;
      let turnos = 0;
      let sizeSum = 0;
      let status = 'Pronto para carregar';
      let onlyPresident = false;
      const toLoad: any[] = [];

      if (file.section.match(/CAND|COLIG|CESP/gim)) {
        return null;
      }

      if (file.section.match(/BR/gim)) {
        onlyPresident = true;
        if (files.length > 1) {
          return null;
        }
      }

      const list = file.files.map((item: any) => {
        const { name, size, id, turno } = item;

        if (!name.match(/cesp/gim)) {
          if (turno?.match(/_/)) {
            turnos += 2;
          } else {
            turnos += 1;
          }
        }

        const hasFile = archived.filter((item: any) => {
          const ref = new RegExp(`^${id}`, 'mig');
          if (item.name.match(ref)) {
            return true;
          }
          return false;
        });

        sizeSum += size;
        toLoad.push(item);

        if (hasFile?.length) {
          loaded = true;
        }

        return (
          <small key={id}>
            {name} → {`${(size / 1024 / 1024).toFixed(2)} MB`}
            {hasFile?.length ? ' ✓' : ''}
          </small>
        );
      });

      if (presidents?.length && !onlyPresident) {
        const year = section.split('-')[1];
        const reg = new RegExp(year, 'mig');
        presidents.forEach((president) => {
          if (president.section.match(reg)) {
            const { name, size, id } = president.files[0];
            toLoad.push(president.files[0]);
            list.push(
              <small key={`${year[0]}-${id}`}>
                {name} → {`${(size / 1024 / 1024).toFixed(2)} MB`} ※
              </small>
            );
          }
        });
      }

      if (candidatos?.length) {
        const year = section.split('-')[1];
        const reg = new RegExp(year, 'mig');
        candidatos.forEach((candidato) => {
          if (candidato.section.match(reg)) {
            const { name, size, id } = candidato.files[0];
            toLoad.push(candidato.files[0]);
            list.push(
              <small key={`${year[0]}-${id}`}>
                {name} → {`${(size / 1024 / 1024).toFixed(2)} MB`} ※
              </small>
            );
          }
        });
      }

      if (coligacoes?.length) {
        const year = section.split('-')[1];
        const reg = new RegExp(year, 'mig');
        coligacoes.forEach((coligacao) => {
          if (coligacao.section.match(reg)) {
            const { name, size, id } = coligacao.files[0];
            toLoad.push(coligacao.files[0]);
            list.push(
              <small key={`${year[0]}-${id}`}>
                {name} → {`${(size / 1024 / 1024).toFixed(2)} MB`} ※
              </small>
            );
          }
        });
      }

      if (turnos === 1) {
        status =
          'Antes de carregar checar se existe um arquivo com o turno oposto desta eleição';
      }

      if (turnos === 0) {
        status = 'Aguardando arquivo de votação';
      }

      const Buttons = function btn() {
        const handleClick = () => {
          runFiles(section, toLoad);
        };

        return (
          <section key={section}>
            <button
              title="Remover"
              type="button"
              onClick={() => {
                clearSection(section);
              }}
            >
              <TrashIcon />
            </button>
            <button
              type="button"
              title="Carregar dados"
              data-id={section}
              data-load={toLoad}
              className="file-loader"
              onClick={handleClick}
            >
              <DownloadIcon />
            </button>
          </section>
        );
      };

      return {
        size: sizeSum,
        type: loaded ? 'disabled' : null,
        data: [
          section,
          { content: list },
          status,
          turnos === 0 ? null : Buttons,
        ],
      };
    });

    const filtered = data
      .filter((item) => !!item)
      .sort((a, b) => a.size - b.size);

    return (
      <div className={styles.files}>
        <Table
          title="Carregamento"
          firstRow={20}
          sortable={false}
          noSelect
          noActions
          header={header}
          data={filtered}
        />
        {renderControls()}
      </div>
    );
  };

  return (
    <>
      <Dropzone
        accept={['application/zip']}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDropAccepted={handleDragLeave}
        onDrop={handleDrop}
      >
        {({ getRootProps, getInputProps }) => {
          return (
            <section className={containerClass.join(' ')}>
              <div className={styles.wrapper} {...getRootProps()}>
                <input {...getInputProps()} />
                <div className={styles.icon}>
                  <DesktopDownloadIcon size={34} />
                </div>
                <h5>Arraste aqui os arquivos do repositório eleitoral</h5>
              </div>
            </section>
          );
        }}
      </Dropzone>
      {renderFiles()}
    </>
  );
};

export default Dropper;
