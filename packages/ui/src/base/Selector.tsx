import { useEffect, useState } from "react";
import { deepClone } from "@gavetaio/core";
// @ts-ignore
import styles from "./Selector.module.scss";
import Button from "./Button";
import { CircleIcon, CheckIcon } from "@primer/octicons-react";

const renderIcon = (name) => {
  if (name === "check") {
    return <CheckIcon size={8} />;
  }
  return <CircleIcon size={7} />;
};

const SelectorItem = ({
  onChange,
  onDouble,
  index,
  parent = null,
  iconName = null,
  radius = false,
  ...item
}: any) => {
  const cls = [];
  const { label, selected } = item;

  if (selected) {
    cls.push(styles.selected);
  }

  const handlePress = (event) => {
    event.stopPropagation();
    onChange({ item, index, parent });
  };

  const handleDouble = (event) => {
    event.stopPropagation();
    onDouble({ item, index, parent });
  };

  return (
    <button type="button" className={cls.join(" ")} onClick={handlePress}>
      <span onDoubleClick={handleDouble}>{label}</span>
      {iconName && renderIcon(iconName)}
    </button>
  );
};

const Selector = ({
  items = [],
  onChange,
  onAction,
  icon = false,
  radio = false,
}: any) => {
  const [data, setData] = useState(items);
  const cls = [styles.container];
  let iconName = null;

  if (radio === true) {
    cls.push(styles.radio);
  }

  if (icon) {
    cls.push(styles.icon);
  }

  if (icon) {
    iconName = radio ? "circle" : "check";
  }

  useEffect(() => {
    setData(items);
  }, [items]);

  useEffect(() => {
    const selected = getSelected(items);
    onChange(items, selected);
  }, []);

  const getSelected = (data) => {
    const selected = [];
    data.forEach((item) => {
      if (item.selected) {
        selected.push(item.value);
        if (item.related) {
          item.related.forEach((item) => {
            if (item.selected) {
              selected.push(item.value);
            }
          });
        }
      }
    });
    return selected;
  };

  const handleDouble = ({ index, parent }) => {};

  const handleChange = ({ index, parent }) => {
    let newData = deepClone(data);
    let interest = parent !== null ? newData[parent].related : newData;
    const isRadio = parent !== null ? newData[parent].radio : radio;

    if (!isRadio) {
      interest[index].selected = !interest[index].selected;
    } else {
      interest = interest.map((item) => {
        item.selected = false;
        return item;
      });
      interest[index].selected = true;
    }

    const selected = getSelected(newData);

    setData(newData);
    onChange(newData, selected);
  };

  const handleAction = () => {
    onAction(data);
  };

  const renderRelated = () => {
    let isRadio = false;

    const items = data
      .map((item, index) => {
        let iconName = null;

        if (!item.selected) {
          return null;
        }

        if (item.radio) {
          isRadio = true;
        }

        if (icon) {
          iconName = isRadio ? "circle" : "check";
        }

        if (!data[index]?.related?.length) {
          return null;
        }

        return data[index].related.map((item, idx) => {
          return (
            <SelectorItem
              onDouble={handleDouble}
              iconName={iconName}
              parent={index}
              index={idx}
              {...item}
              onChange={handleChange}
            />
          );
        });
      })
      .filter((item) => !!item);

    if (!items.length) {
      return null;
    }

    const cls = [styles.related];

    if (isRadio) {
      cls.push(styles.radio);
    }

    return <div className={styles.related}>{items}</div>;
  };

  return (
    <div className={cls.join(" ")}>
      <div className={styles.main}>
        {data.map((item, index) => (
          <SelectorItem
            onDouble={handleDouble}
            iconName={iconName}
            index={index}
            {...item}
            onChange={handleChange}
          />
        ))}
      </div>
      {renderRelated()}
      {onAction && <Button onClick={handleAction}>Carregar</Button>}
    </div>
  );
};

export default Selector;
