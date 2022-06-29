import { useEffect, useState, useRef } from "react";
import {
  TriangleDownIcon,
  TriangleUpIcon,
  CopyIcon,
  MarkdownIcon,
} from "@primer/octicons-react";
import { getDeviationInfo, forEachList, roundTwo } from "@gavetaio/core";
import copy from "clipboard-copy";
import Block from "./Block";
// @ts-ignore
import styles from "./Table.module.scss";

const tableMarkdown = (data) => {
  let result = [];

  if (data?.header?.length) {
    const header = [];
    const dashes = [];
    data.header.forEach((item) => {
      let text = "X";
      let dash = "";
      if (typeof item === "string" || typeof item === "number") {
        text = `${item}`;
      }
      if (item?.list) {
        text = item.list.join(", ");
      }
      header.push(text);
      for (let i = 0; i < text.length; i += 1) {
        dash += "-";
      }
      dashes.push(dash);
    });
    result.push(`| ${header.join(" | ")} |`);
    result.push(`| ${dashes.join(" | ")} |`);
  }

  if (data.data) {
    data.data.forEach((item) => {
      const row = [];
      const list = Array.isArray(item) ? item : item.data;
      list.forEach((txt) => {
        if (typeof txt === "string" || typeof txt === "number") {
          row.push(`${txt}`);
          return;
        }
        if (txt.label) {
          row.push(txt.label);
          return;
        }
        if (txt.value) {
          row.push(txt.value);
          return;
        }
        if (txt.list?.length) {
          row.push(txt.list.join(", "));
          return;
        }
        row.push("X");
      });
      result.push(`| ${row.join(" | ")} |`);
    });
  }

  return result.join("\n");
};

const dottedNumber = (number) => {
  if (number < 1000) {
    return roundTwo(number).toString();
  }
  const str = number.toString();
  return str.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.");
};

const getDataType = (data, index) => {
  const dataArray = data[0]?.data ? data[0].data : data[0];
  const dataType = !!dataArray?.[index]?.value;
  let compare = null;

  if (dataType) {
    if (dataArray?.[index]?.value) {
      compare = dataArray[index].value;
    } else if (dataArray?.[index]) {
      compare = dataArray[index];
    }
  } else {
    compare = dataArray[index];
  }
  const value = compare * 1 || compare;
  const type = typeof value === "string" ? 1 : 0;
  return { value, type, dataType, dataArray };
};

const sortList = (list, index, direction) => {
  if (!list?.length) {
    return list;
  }

  const data = [...list];
  const { type } = getDataType(data, index);

  const getValue = (data) => {
    return data?.value !== undefined ? data.value : data || "";
  };

  const sortable = (a, b) => {
    if (type === 1) {
      return getValue(a).localeCompare(getValue(b));
    }

    return getValue(a) - getValue(b);
  };

  const sortData = (initial, final) => {
    const initialData = initial?.data || initial;
    const finalData = final?.data || final;
    return sortable(initialData[index], finalData[index]);
  };

  data.sort(sortData);

  if (direction === -1) {
    data.reverse();
  }

  return data;
};

const Table = ({
  header,
  data,
  footer,
  after,
  title = null,
  titleActions = null,
  danger = false,
  warning = false,
  noMargin = false,
  noHover = false,
  noActions = false,
  noSelect = false,
  sortDefault = 0,
  deviation = false,
  sortable = true,
  open = false,
  firstRow = null,
  id = "",
}: any) => {
  const cls = [styles.container];
  const wrp = [styles.wrapper];
  const [list, setList]: any = useState([]);
  const [selected, setSelected]: any = useState([]);
  const [direction, setDirection]: any = useState(0);
  const dir = useRef({});
  const styleObj: any = {};

  useEffect(() => {
    if (!data) {
      return;
    }
    if (sortable) {
      handleFilter(Math.abs(sortDefault), sortDefault < 0 ? 1 : -1);
      return;
    }
    setList(data);
  }, [data]);

  if (header?.length) {
    cls.push(styles[`length_${header.length}`]);
  }

  if (danger) {
    wrp.push(styles.danger);
  }
  if (warning) {
    cls.push(styles.warning);
  }
  if (noMargin) {
    wrp.push(styles.noMargin);
  }
  if (noHover === false) {
    cls.push(styles.hoverable);
  }
  if (open) {
    cls.push(styles.openText);
  }

  if (firstRow) {
    styleObj[`--first-row`] = `${firstRow}%`;
  }

  const renderAfter = () => {
    if (!after) {
      return null;
    }
    // @ts-ignore
    return <div className={styles.after}>{after}</div>;
  };

  const handleFilter = (index, def = 1) => {
    setSelected([]);
    const next = {};
    next[index] = def ? def : dir.current[index] ? dir.current[index] * -1 : 1;
    dir.current[index] = next[index];
    const newData = sortList(data, index, dir.current[index]);
    setDirection(next);
    setList(newData);
  };

  const renderHeader = () => {
    if (!header?.length) {
      return null;
    }

    const getIcon = (index) => {
      if (direction?.[index]) {
        if (direction[index] === 1) {
          return <TriangleDownIcon />;
        }
        return <TriangleUpIcon />;
      }
    };

    return (
      <thead>
        <tr>
          {header.map((txt, index) => {
            if (typeof txt === "string") {
              return (
                <th
                  onClick={() => {
                    handleFilter(index, null);
                  }}
                  key={`${id}-header-${index}`}
                >
                  <div>
                    {getIcon(index)}
                    <h6>{txt}</h6>
                  </div>
                </th>
              );
            }

            const extra: any = {};

            if (txt?.connected) {
              extra.className = styles.connected;
            }

            return (
              <th
                onClick={() => {
                  handleFilter(index, null);
                }}
                key={`${id}-header-${index}`}
                {...extra}
              >
                <div>
                  <h6>{txt.label}</h6>
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
    );
  };

  const getSum = () => {
    const sum = [];
    if (!list?.length) {
      return sum;
    }
    for (let i = 0; i < list.length; i += 1) {
      const tr = list[i];
      let rows = null;

      if (selected?.length && selected.indexOf(i) === -1) {
        continue;
      }

      if (tr?.data) {
        rows = tr.data;
      } else {
        rows = tr;
      }

      if (!rows?.length) {
        continue;
      }

      rows.forEach((row, index) => {
        if (!footer[index]) {
          return;
        }

        if (typeof footer[index] === "object" && !footer[index].type) {
          return;
        }

        if (
          typeof footer[index] === "string" &&
          !footer[index].match(/count|sum|average/gim)
        ) {
          return;
        }

        const info: any = {
          type: null,
          prefix: "",
          suffix: "",
        };

        if (typeof footer[index] === "object") {
          info.type = footer[index]?.type || "sum";
          info.suffix = footer[index]?.suffix || "";
          info.prefix = footer[index]?.prefix || "";
        }

        if (typeof footer[index] === "string") {
          info.type = footer[index];
        }

        if (!sum[index]) {
          sum[index] = {
            value: 0,
            count: 0,
            acc: 0,
            suffix: info.suffix,
            prefix: info.prefix,
          };
        }

        if (info.type === "count") {
          sum[index].value += 1;
          return;
        }

        if (info.type === "sum") {
          const value = row?.value || row || 0;

          if (typeof value === "number") {
            sum[index].value += value;
          }
        }

        if (info.type === "average") {
          const value = (row?.value || row) * 1;

          if (typeof value === "number" && !isNaN(value)) {
            sum[index].count += 1;
            sum[index].acc += value;
          }
          return;
        }
      });
    }

    if (sum?.length) {
      sum.forEach((row) => {
        if (row.acc) {
          row.value = Math.round((10 * row.acc) / row.count) / 10;
        }
      });
    }

    return sum;
  };

  const getFooterData = () => {
    const result = [];

    const sum = getSum();

    footer.forEach((txt, index) => {
      if (typeof txt === "number") {
        result.push({ value: txt, label: txt });

        return;
      }
      if (!sum[index]) {
        result.push({});
        return;
      }

      const { prefix, suffix, value } = sum[index];

      result.push({
        value,
        label: `${prefix} ${dottedNumber(value)} ${suffix}`.trim(),
      });
    });

    if (deviation) {
      const calc = getDeviationInfo(
        result
          .slice(1, result.length)
          .map(({ value }) => parseFloat(value) || 0)
      );

      let previous = null;
      result.forEach((item, index) => {
        if (index === 0) {
          return;
        }
        const sigma = (item.value - calc.mean) / calc.deviation;
        if (previous === null) {
          previous = sigma;
          return;
        }
        const diff = sigma - previous;
        previous = sigma;
        item.extra = diff > 0 ? `+${diff.toFixed(2)}` : `${diff.toFixed(2)}`;
      });
    }

    return result;
  };

  const renderFooter = () => {
    if (!footer?.length) {
      return null;
    }

    const data = getFooterData();

    return (
      <tfoot>
        <tr>
          {data.map(({ label = "", extra = "" }, index) => {
            return (
              <th key={`${id}-footer-${index}`}>
                <h6>
                  <span className={styles.withExtra} data-extra={extra}>
                    {label || ""}
                  </span>
                </h6>
              </th>
            );
          })}
        </tr>
      </tfoot>
    );
  };

  const handleSelect = (index) => {
    if (noSelect) {
      return false;
    }
    let newSelection = [...selected];
    const compare = newSelection.indexOf(index);
    if (compare === -1) {
      newSelection.push(index);
    } else {
      newSelection = newSelection.filter((item) => item !== index);
    }
    setSelected(newSelection);
  };

  const handleCopy = (event) => {
    let target = event.target;

    while (target) {
      if (target.tagName.match(/td/gim)) {
        break;
      }
      target = target.parentElement;
    }

    if (target && target.innerText) {
      const span = target.querySelector("span");
      if (span) {
        if (span.getAttribute("data-extra")) {
          copy(span.getAttribute("data-extra"));
          return;
        }
      }

      copy(target.innerText);
    }
  };

  const calcDeviation = () => {
    const accumulator = {};

    list.forEach((line, index) => {
      if (!line) {
        return null;
      }
      let rows = null;

      if (line?.data) {
        rows = line.data;
      } else {
        rows = line;
      }
      if (!rows?.length) {
        return null;
      }
      rows.forEach((txt: any, idx) => {
        let value: any = null;
        if (txt?.value) {
          value = txt.value;
        }

        if (typeof txt === "object") {
          return;
        }

        if (typeof txt === "number") {
          value = txt;
        }

        if (typeof txt === "string") {
          value = parseFloat(txt);
        }

        if (isNaN(value)) {
          return;
        }

        if (!accumulator[`row-${idx}`]) {
          accumulator[`row-${idx}`] = [];
        }
        accumulator[`row-${idx}`].push(value);
      });
    });
    forEachList(accumulator, (line, data) => {
      const deviation = getDeviationInfo(data);
      accumulator[line] = deviation;
    });
    return accumulator;
  };

  const renderBody = () => {
    if (!data?.length) {
      return null;
    }

    let calc = null;
    if (deviation) {
      calc = calcDeviation();
    }

    return (
      <tbody>
        {list.map((line, index) => {
          if (!line) {
            return null;
          }

          let rows = null;
          const cls: any = [];
          const extra: any = {};

          if (selected.indexOf(index) !== -1) {
            cls.push(styles.selected);
          }
          if (line?.type) {
            cls.push(styles[line.type]);
          }

          if (line?.data) {
            rows = line.data;
          } else {
            rows = line;
          }

          if (!rows?.length) {
            return null;
          }

          const printed = rows.map((txt, idx) => {
            let deviation = null;
            if (calc?.[`row-${idx}`]) {
              //
              deviation = calc[`row-${idx}`];
            }

            if (
              txt &&
              (Array.isArray(txt) || (txt?.list && Array.isArray(txt.list)))
            ) {
              const list = txt?.list || txt;

              return (
                <td>
                  <ul>
                    {list.map((item) => {
                      if ((typeof item).match(/string|number/gim)) {
                        return (
                          <li>
                            <span>{item}</span>
                          </li>
                        );
                      }

                      const { value, label, extra } = item;

                      return (
                        <li>
                          <span className={styles.withExtra} data-extra={extra}>
                            {label || value}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </td>
              );
            }
            if (txt && typeof txt === "object") {
              if (txt.props) {
                return <td key={idx}>{txt}</td>;
              }

              const {
                connected = false,
                value,
                label,
                size,
                extra,
                type,
                content,
                Element,
                suffix,
                onClick = () => null,
              } = txt;

              const extraProps: any = {};

              if (onClick) {
                extraProps.onClick = onClick;
              }

              const classNames = [];
              if (size) {
                classNames.push(styles[size]);
              }
              if (type) {
                classNames.push(styles[type]);
              }
              if (onClick) {
                classNames.push(styles.clickable);
              }
              if (connected) {
                classNames.push(styles.connected);
              }

              const extraString = extra || "";
              const spanExtraProp: any = {};

              if (deviation && !isNaN(value)) {
                const calcDev = (value - deviation.mean) / deviation.deviation;
                spanExtraProp["data-extra"] = `${calcDev.toFixed(
                  1
                )} | ${deviation.error.toFixed(1)}`;
                spanExtraProp.className = styles.withExtra;
              }

              if (extraString) {
                spanExtraProp["data-extra"] = extraString;
                spanExtraProp.className = styles.withExtra;
              }

              const stringValue = label
                ? label
                : typeof value === "number"
                ? dottedNumber(value)
                : value;

              const rendered = content ? (
                content
              ) : Element ? (
                <Element />
              ) : (
                <span {...spanExtraProp}>
                  {stringValue}
                  {suffix ? ` ${suffix}` : ""}
                </span>
              );

              return (
                <td
                  onDoubleClick={handleCopy}
                  key={`${id}-body-${index}-${idx}`}
                  className={classNames.join(" ")}
                  data-value={value}
                  {...extraProps}
                >
                  {rendered}
                </td>
              );
            }

            const extraProps: any = {};

            if (typeof txt === "function") {
              return <td key={idx}>{txt()}</td>;
            }

            if (typeof txt === "number") {
              if (deviation) {
                const calcDev = (txt - deviation.mean) / deviation.deviation;
                extraProps["data-extra"] = `${calcDev.toFixed(
                  1
                )} | ${deviation.error.toFixed(1)}`;
                extraProps.className = styles.withExtra;
              }

              return (
                <td
                  onDoubleClick={handleCopy}
                  key={`${id}-body-${index}-${idx}`}
                >
                  <span {...extraProps}>{dottedNumber(txt)}</span>
                </td>
              );
            }

            if (typeof txt === "string") {
              if (deviation) {
                const num: any = parseFloat(txt);

                if (!isNaN(num)) {
                  const calcDev = (num - deviation.mean) / deviation.deviation;
                  extraProps["data-extra"] = `${calcDev.toFixed(
                    1
                  )} | ${deviation.error.toFixed(1)}`;
                  extraProps.className = styles.withExtra;
                }
              }

              return (
                <td
                  onDoubleClick={handleCopy}
                  key={`${id}-body-${index}-${idx}`}
                >
                  <span {...extraProps}>{txt}</span>
                </td>
              );
            }

            if (header[idx] && header[idx].transform) {
              const data = header[idx].transform(line);
              return (
                <td onDoubleClick={handleCopy} key={data}>
                  <span {...extraProps}>{data}</span>
                </td>
              );
            }

            return (
              <td onDoubleClick={handleCopy} key={idx}>
                <span {...extraProps}>{txt}</span>
              </td>
            );
          });

          if (line?.onClick) {
            cls.push(styles.clickable);
            extra.onClick = line.onClick;
          }

          return (
            <tr
              onClick={() => {
                handleSelect(index);
              }}
              className={cls.join(" ")}
              key={`${id}-body-${index}`}
              {...extra}
            >
              {printed}
            </tr>
          );
        })}
      </tbody>
    );
  };

  const handleCopyData = () => {
    let exportedData = data;
    if (selected?.length) {
      exportedData = selected.map((index) => data[index]);
    }
    const exported = JSON.stringify({ header, data: exportedData, footer });
    copy(exported);
  };

  const handleCopyMarkdown = () => {
    let exportedData = list;
    if (selected?.length) {
      exportedData = selected.map((index) => data[index]);
    }
    const exported = tableMarkdown({ header, data: exportedData, footer });
    copy(exported);
  };

  const renderActions = () => {
    const actions = [];

    if (noActions) {
      return null;
    }

    actions.push(
      <button onClick={handleCopyData}>
        <CopyIcon />
      </button>
    );

    actions.push(
      <button onClick={handleCopyMarkdown}>
        <MarkdownIcon />
      </button>
    );

    if (titleActions?.length) {
      titleActions.forEach(({ icon, action }) => {
        actions.push(<button onClick={action}>{icon}</button>);
      });
    }

    return actions;
  };

  const renderTable = () => {
    if (!data?.length) {
      return null;
    }

    return (
      <Block
        noMargin
        noPadding
        title={
          <>
            <span className={styles.header}>
              <span>{title}</span>
              {renderActions()}
            </span>
          </>
        }
      >
        <table className={cls.join(" ")}>
          {renderHeader()}
          {renderBody()}
          {renderFooter()}
        </table>
      </Block>
    );
  };

  return (
    <div className={wrp.join(" ")} style={styleObj}>
      {renderTable()}
      {renderAfter()}
    </div>
  );
};

export default Table;
