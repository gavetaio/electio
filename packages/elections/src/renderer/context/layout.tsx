/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { forEachList } from '@gavetaio/core';
import React, { useState, useRef, useEffect, useContext } from 'react';
import { deepClone } from 'renderer/components/helpers/utils';

const LayoutInitialState: any = {
  title: '@gavetaio',
  search: '',
  jsons: [],
  list: [],
  boxes: [],
  base: {},
  sections: [],
  filters: {},
  unavailable: [],
  sectionStatus: { title: null, main: null },
};

const getLocalData = () => {
  const result: any = {
    saved: null,
  };
  const saved = localStorage.getItem('@data/saved');

  if (saved) {
    result.saved = JSON.parse(saved);
  }

  return result;
};

const ApiInitialState = {
  elections: {},
};

const useLayoutContext = () => {
  return useContext(LayoutContext);
};

const LayoutContext = React.createContext([{}, () => {}]);

const LayoutProvider = ({ children }: any) => {
  const ref: any = useRef({
    ...LayoutInitialState,
    ...getLocalData(),
  });
  const [value, setValue] = useState(ref.current);
  const [apiData, setApiData] = useState(ApiInitialState);

  const apiDataRef: any = useRef(ApiInitialState);
  const loaderRef: any = useRef(0);

  useEffect(() => {
    // @ts-ignore
    const { files, api } = window.electron;

    files.folder();
    api.on('api-done', ({ data }: any) => {
      if (data?.upsert) {
        const ref = deepClone(apiDataRef.current);
        const name = data.upsert.name;

        if (!ref[`${name}`]) {
          ref[`${name}`] = {};
        }

        forEachList(data.upsert.data, (id, info) => {
          ref[`${name}`][id] = info;
        });

        apiDataRef.current = ref;
        setApiData({ ...ref });
        return;
      }

      setData({ ...data });
    });

    files.on('folder-done', ({ data }: any) => {
      setLayout({ folder: data });
    });

    files.on('files-done', ({ type, data, id = null }: any) => {
      if (type === 'boxes') {
        setLayout({ boxes: data });
        decrementLoader();
      }
      if (type === 'jsons') {
        setLayout({ jsons: data });
      }

      if (type === 'candidates') {
        setLayout({ candidates: data });
        decrementLoader();
      }
      if (type === 'elections') {
        setLayout({ elections: data });
        decrementLoader();
      }

      if (type === 'list') {
        setLayout({ list: data });
        decrementLoader();
      }

      if (type === 'base') {
        const newBase = {
          ...deepClone(ref.current.base),
          [`${id}`]: data,
        };

        setLayout({ base: newBase });
        decrementLoader();
      }
    });

    return () => {};
  }, []);

  const getData = () => {
    return apiData;
  };

  const decrementLoader = () => {
    if (!loaderRef?.current) {
      return;
    }
    loaderRef.current -= 1;

    if (!loaderRef.current) {
      setLoader({ ...ref.current.loader, visible: false });
    }
  };

  const apiGet = ({ action, params }) => {
    // @ts-ignore
    const { api } = window.electron;
    api.get({ action, params });
  };

  const incrementLoader = () => {
    if (!loaderRef?.current) {
      setLoader({ visible: true, title: 'Carregando ..' });
    }

    loaderRef.current += 1;
  };

  const pushSection = (section) => {
    const { sections } = ref.current;
    const list = deepClone(sections);
    const currentId = list.findIndex((item) => item.id === section.id);
    if (currentId !== -1) {
      list[currentId] = section;
    } else {
      list.push(section);
      list.sort((a, b) => a.position - b.position);
    }

    const status = deepClone(ref.current.sectionStatus);
    const firstVisible = list.findIndex((item) => item.visible === true);

    if (firstVisible === 0) {
      status.title = null;
      status.main = null;
      setLayout({ sections: list, sectionStatus: status });
      return;
    }

    if (firstVisible !== -1 && list[firstVisible - 1]) {
      const current = list[firstVisible - 1];
      status.title = current?.status?.title || null;
      if (current?.status?.main) {
        status.main = current.status.main;
      } else {
      }

      setLayout({ sections: list, sectionStatus: status });
      return;
    }

    if (currentId !== -1) {
      const current = list[currentId];
      //
      status.title = current?.status?.title || null;

      if (current?.status?.main) {
        status.main = current.status.main;
      }
      setLayout({ sections: list, sectionStatus: status });
    }
  };

  const refreshData = async ({ types = ['jsons'], params = null } = {}) => {
    // @ts-ignore
    const { files } = window.electron;
    if (types.indexOf('boxes') !== -1) {
      incrementLoader();
    }
    if (types.indexOf('list') !== -1) {
      incrementLoader();
    }

    files.get({ types, params });
  };

  const setData = (params: any) => {
    const data = {
      ...apiDataRef.current,
      ...params,
    };
    apiDataRef.current = data;
    setApiData({ ...data });
  };

  const setLayout = (params: any) => {
    const layout = {
      ...ref.current,
      ...params,
    };

    ref.current = layout;

    setValue({ ...layout });
  };

  const saveLayout = (params: any) => {
    const saved = {
      ...ref.current.saved,
    };

    const { history = [] } = saved;

    if (params?.latest) {
      saved.latest = params.latest;
      history.push(params.latest);
      saved.history = history.slice(-5);
    }

    localStorage.setItem('@data/saved', JSON.stringify(saved));
    setLayout({ saved });
  };

  const setLoader = (params: any) => {
    // @ts-ignore
    const loader = ref.current?.loader
      ? // @ts-ignore
        { ...ref.current.loader, ...params }
      : params;
    setLayout({ loader: params });
  };

  const getLayout = () => {
    return value;
  };

  return (
    <LayoutContext.Provider
      value={{
        // @ts-ignore
        apiGet,
        getData,
        setLayout,
        saveLayout,
        setLoader,
        getLayout,
        refreshData,
        pushSection,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export { LayoutContext, LayoutProvider, useLayoutContext };
