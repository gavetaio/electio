import { useRef, useEffect } from "react";
// @ts-ignore
import styles from "./LineChart.module.scss";
import Block from "./Block";
import copy from "clipboard-copy";
import unique from "array-unique";
import { CopyIcon } from "@primer/octicons-react";
import { roundTwo } from "@gavetaio/core";

const getRandomColor = () => {
  let hex = "";
  while (hex.length !== 6) {
    hex = Math.floor(Math.random() * 16777215).toString(16);
  }
  return `#${hex}`;
};

type ChartLineProps = {
  labelX?: string;
  labelY?: string;
  data?: any[];
  ratio?: number;
  padding?: number;
  yMax?: number;
  lineColor?: string;
  title?: string;
};

function radians_to_degrees(radians) {
  var pi = Math.PI;
  return radians * (180 / pi);
}

const getYLabels = (data, max) => {
  const labels: any[] = [];
  if (!data?.length) {
    return labels;
  }

  const step: number = max / 5;

  for (let i = 1; i < 5; i += 1) {
    labels.push(`${roundTwo(step * i)}`);
  }

  const result = labels.map((label) => {
    let ref = label;
    if (label * 1 >= 1000000) {
      ref = `${roundTwo((label * 1) / 1000000)}M`;
    } else if (label * 1 >= 1000) {
      ref = `${roundTwo((label * 1) / 1000)}K`;
    }

    return ref;
  });

  return [...result, ""];
};

const getYMax = (data) => {
  if (!data?.length) {
    return 100;
  }

  let max = 0;
  let min = 0;

  forEachPoint(data, ({ point }) => {
    const y = point[1] * 1;
    if (y > max) {
      max = y;
    }
    if (!min || y < min) {
      min = y;
    }
  });

  if (max === 0) {
    max = 100;
  }

  const calc = 1 + min / max / 2 / 2;

  max = Math.ceil(max * calc);

  let limit: any = "1";
  for (let i = 1; i < `${max}`.length; i += 1) {
    limit += "0";
  }

  limit = parseInt(limit, 10);

  while (true) {
    max += 1;
    if (max % limit === 0) {
      break;
    }
  }

  return max;
};

const forEachLine = (data, callback) => {
  if (!data?.length) {
    return;
  }
  for (let i = 0; i < data.length; i += 1) {
    const line = data[i];
    if (!line?.length && !line?.points?.length) {
      continue;
    }
    const points = line?.length ? line : line.points;
    const label = line?.label || null;

    callback({ line: i, label, points });
  }
};

const forEachPoint = (data, callback) => {
  if (!data?.length) {
    return null;
  }
  forEachLine(data, ({ line, label, points }) => {
    for (let j = 0; j < points.length; j += 1) {
      callback({
        line,
        set: j,
        label,
        point: points[j],
      });
    }
  });
};

const getXLabels = (data) => {
  let labels = [];
  if (!data?.length) {
    return labels;
  }

  forEachPoint(data, ({ point }) => {
    labels.push(point[0]);
  });

  labels = unique(labels);

  if (labels[0] && parseInt(labels[0])) {
    labels = labels
      .map((label) => parseInt(label))
      .sort((a, b) => a - b)
      .map((label) => `${label}`);
  } else {
    labels = labels.sort().map((label) => `${label}`);
  }

  return [...labels, ""];
};

const getCoordPoints = ({ dimensions, labels }) => {
  const coords = {};
  const { yLabels, xLabels, ySize, xSize } = labels;
  const { axis } = dimensions;

  for (let i = 0; i < yLabels.length; i += 1) {
    coords[`y${i}`] = roundTwo(axis.zero[1] - ySize * (i + 1));
  }

  for (let i = 0; i < xLabels.length; i += 1) {
    coords[`x${i}`] = roundTwo(axis.zero[0] + xSize * (i + 1));
  }

  return coords;
};

const getLines = ({ data, coords, dimensions, labels }) => {
  const lines = [];
  const { xLabels } = labels;
  const { axis, axisYSize, yMax } = dimensions;

  forEachLine(data, ({ points }) => {
    const list = [];
    const yBase = axis.zero[1];

    points.forEach((point) => {
      const coordX = coords[`x${xLabels.indexOf(point[0])}`];
      const coordY = roundTwo(yBase - axisYSize * (point[1] / yMax));
      list.push(`${coordX},${coordY}`);
    });

    lines.push(list);
  });
  return lines;
};

const getDimensions = ({ ratio, data, yMax }) => {
  const width = 600;
  const dimensions: any = {
    unit: 4,
    width,
    height: roundTwo(width * ratio),
    padding: 0.125,
  };

  dimensions.paddingY = roundTwo(dimensions.height * dimensions.padding);
  dimensions.paddingX = roundTwo((dimensions.width * dimensions.padding) / 2);

  dimensions.yMax = yMax || getYMax(data);

  dimensions.axis = {
    zero: [dimensions.paddingX, dimensions.height - dimensions.paddingY],
    ymax: [dimensions.paddingX, dimensions.paddingY],
    xmax: [
      roundTwo(width - dimensions.paddingX),
      roundTwo(dimensions.height - dimensions.paddingY),
    ],
  };

  dimensions.axisXSize = roundTwo(dimensions.width - dimensions.paddingX * 2);
  dimensions.axisYSize = roundTwo(dimensions.height - dimensions.paddingY * 2);

  return dimensions;
};

const getLabels = ({ data, dimensions }) => {
  const xLabels = getXLabels(data);
  const yLabels = getYLabels(data, dimensions.yMax);

  return {
    yLabels,
    xLabels,
    xSize: roundTwo(dimensions.axisXSize / xLabels.length),
    ySize: roundTwo(dimensions.axisYSize / yLabels.length),
  };
};

const LineChart = ({
  labelX = "Eleições",
  labelY = "Municipais",
  data = [],
  ratio = 1 / 2,
  padding = 0.125,
  lineColor = "#7a7a7a",
  yMax = 0,
  title = null,
}: ChartLineProps) => {
  const unit = 4;
  const colors = useRef(["#cf8326", "#c12e3a", "#4c6394", "#153068"]);
  const helperX = useRef(null);
  const helperY = useRef(null);
  const helper2X = useRef(null);
  const helper2Y = useRef(null);
  const helper2C1 = useRef(null);
  const grid = useRef(null);
  const graph = useRef(null);
  const labelsRef = useRef(null);

  const dimensions = getDimensions({ ratio, data, yMax });
  const labels = getLabels({ data, dimensions });

  const coords = getCoordPoints({
    dimensions,
    labels,
  });

  const lines = getLines({ data, coords, dimensions, labels });

  const updateLineLabelPosition = () => {
    const items = graph.current.querySelectorAll(`.${styles.lineLabel}`);
    let position = 0;
    if (!items?.length) {
      return;
    }

    items.forEach((item, index) => {
      const { width } = item.getBoundingClientRect();
      if (index === 0) {
        position += width;
        return;
      }
      item.style.transform = `translateX(${roundTwo(position)}px)`;
      position += width;
    });
  };

  useEffect(() => {
    updateLineLabelPosition();
  }, [data]);

  const handleLinePress = (event: any) => {};
  const mouseEnter = (event: any) => {
    const element = event.target;
    const parent = element.parentNode;
    const container = parent.parentNode.parentNode;

    const xPos = element.getAttribute("cx");
    const hx = helperX.current;
    const hy = helperY.current;
    const x = element.getAttribute("cx");
    const y = element.getAttribute("cy");
    const text = labelsRef.current.querySelector(`text[x="${xPos}"]`);

    if (text?.classList) {
      text.classList.add(styles.textHover);
    }

    container.classList.add(styles.lineHover);
    graph.current.classList.add(styles.graphHover);
    hx.classList.add(styles.helperVisible);
    hy.classList.add(styles.helperVisible);
    grid.current.classList.add(styles.gridHidden);

    hx.setAttribute("x1", x);
    hx.setAttribute("x2", x);
    hy.setAttribute("y1", y);
    hy.setAttribute("y2", y);

    parent.classList.add(styles.circleHover);
  };

  const mousePress = (event: any) => {
    const element = event.target;
    const parent = element.parentNode;

    const previous = parent.previousSibling || parent.nextSibling;

    if (!previous) {
      return;
    }

    const h2x = helper2X.current;
    const h2y = helper2Y.current;
    const h2c1 = helper2C1.current;

    const circle = previous.querySelector("circle");

    h2x.classList.add(styles.helperVisible);
    h2y.classList.add(styles.helperVisible);
    h2c1.classList.add(styles.helperVisible);

    const params: any = {};
    params.x0 = circle.getAttribute("cx");
    params.y0 = circle.getAttribute("cy");
    params.x1 = element.getAttribute("cx");
    params.y1 = element.getAttribute("cy");

    h2x.setAttribute("x1", params.x0);
    h2x.setAttribute("x2", params.x0);
    h2y.setAttribute("y1", params.y0);
    h2y.setAttribute("y2", params.y0);

    h2c1.setAttribute("x", params.x1 * 1 + (params.x0 - params.x1) / 2);
    h2c1.setAttribute("y", params.y0 * 1 + 4);

    const triangle = {
      b: Math.abs(params.x0 - params.x1),
      c: Math.abs(params.y0 - params.y1),
    };

    h2c1.innerHTML = `${radians_to_degrees(
      Math.atan(triangle.c / triangle.b)
    ).toFixed(1)}º`;
  };

  const mouseLeave = (event: any) => {
    const element = event.target;
    const parent = element.parentNode;
    const hx = helperX.current;
    const hy = helperY.current;
    const h2x = helper2X.current;
    const h2y = helper2Y.current;
    const h2c1 = helper2C1.current;
    const container = parent.parentNode.parentNode;

    const labelHovers = labelsRef.current.querySelectorAll(
      `.${styles.textHover}`
    );

    if (labelHovers?.length) {
      labelHovers.forEach((el) => {
        el.classList.remove(styles.textHover);
      });
    }

    container.classList.remove(styles.lineHover);
    graph.current.classList.remove(styles.graphHover);
    hx.classList.remove(styles.helperVisible);
    hy.classList.remove(styles.helperVisible);
    h2x.classList.remove(styles.helperVisible);
    h2y.classList.remove(styles.helperVisible);
    parent.classList.remove(styles.circleHover);
    h2c1.classList.remove(styles.helperVisible);
    grid.current.classList.remove(styles.gridHidden);
  };

  const handleToggleLine = (event: any) => {
    const element = event.target;
    const parent = element.parentNode.parentNode;
    if (parent.classList.contains(styles.inactive)) {
      parent.classList.remove(styles.inactive);
      return;
    }
    parent.classList.add(styles.inactive);
  };

  const printGrid = () => {
    const { xLabels, yLabels } = labels;
    const { axis } = dimensions;
    return (
      <>
        <g>
          {xLabels.map((label, index) => {
            return (
              <line
                strokeWidth="1"
                fillOpacity="1"
                strokeOpacity="1"
                strokeLinejoin="miter"
                stroke={lineColor}
                key={`line-x-${index}`}
                x1={coords[`x${index}`]}
                y1={axis.ymax[1]}
                x2={coords[`x${index}`]}
                y2={axis.zero[1]}
              />
            );
          })}
        </g>
        <g>
          {yLabels.map((label, index) => {
            return (
              <line
                strokeWidth="1"
                fillOpacity="1"
                strokeOpacity="1"
                strokeLinejoin="miter"
                stroke={lineColor}
                key={`line-y-${index}`}
                x1={axis.xmax[0]}
                y1={coords[`y${index}`]}
                x2={axis.zero[0]}
                y2={coords[`y${index}`]}
              />
            );
          })}
        </g>
        <line
          ref={helperX}
          className={styles.helper}
          strokeWidth="1"
          fillOpacity="1"
          strokeOpacity="1"
          strokeLinejoin="miter"
          strokeDasharray="4"
          strokeDashoffset="4"
          stroke={lineColor}
          x1={coords[`x0`]}
          y1={axis.ymax[1]}
          x2={coords[`x0`]}
          y2={axis.zero[1]}
        />
        <line
          ref={helperY}
          className={styles.helper}
          strokeWidth="1"
          fillOpacity="1"
          strokeOpacity="1"
          strokeLinejoin="miter"
          strokeDasharray="4"
          strokeDashoffset="4"
          stroke={lineColor}
          x1={axis.xmax[0]}
          y1={coords[`y0`]}
          x2={axis.zero[0]}
          y2={coords[`y0`]}
        />
        <line
          ref={helper2X}
          className={styles.helper}
          strokeWidth="1"
          fillOpacity="1"
          strokeOpacity="1"
          strokeLinejoin="miter"
          strokeDasharray="4"
          strokeDashoffset="4"
          stroke={lineColor}
          x1={coords[`x0`]}
          y1={axis.ymax[1]}
          x2={coords[`x0`]}
          y2={axis.zero[1]}
        />
        <line
          ref={helper2Y}
          className={styles.helper}
          strokeWidth="1"
          fillOpacity="1"
          strokeOpacity="1"
          strokeDasharray="4"
          strokeDashoffset="4"
          strokeLinejoin="miter"
          stroke={lineColor}
          x1={axis.xmax[0]}
          y1={coords[`y0`]}
          x2={axis.zero[0]}
          y2={coords[`y0`]}
        />
        <text
          ref={helper2C1}
          className={styles.helperAnglular}
          fontSize="8"
          x={coords[`x0`]}
          y={coords[`y0`]}
          fill={lineColor}
          textAnchor="middle"
          dominantBaseline="hanging"
        >
          60º
        </text>
      </>
    );
  };

  const getColorIndex = (index) => {
    if (!colors.current[index + 1]) {
      colors.current.push(getRandomColor());
    }
    return index + 1;
  };

  const printLines = () => {
    let colorIndex = 0;
    const { axis } = dimensions;
    const result = [];

    forEachLine(data, ({ line, points, label }) => {
      colorIndex = getColorIndex(colorIndex);
      const color = colors.current[colorIndex];
      //

      result.push(
        <g className={styles.line}>
          <polyline
            key={`line-${line}`}
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={lines[line].join(" ")}
            onClick={handleLinePress}
          />
          <g>
            {points.map((point, idx) => {
              return printPoint({ point, color, position: idx });
            })}
          </g>
          {label && (
            <g className={styles.lineLabel}>
              <circle
                onClick={handleToggleLine}
                cx={axis.ymax[0] + unit * 3}
                cy={axis.ymax[1] - unit * 3 - 1}
                r="2"
                stroke={color}
                strokeWidth="4"
                strokeOpacity="1"
                fill={color}
              />
              <text
                fontSize="10"
                fontWeight="bold"
                onClick={handleToggleLine}
                x={axis.ymax[0] + unit * 5}
                y={axis.ymax[1] - unit * 3}
                textAnchor="start"
                dominantBaseline="middle"
                fill={lineColor}
              >
                {label}
              </text>
            </g>
          )}
        </g>
      );
    });

    return <>{result}</>;
  };

  const printPoint = ({ point, color, position }) => {
    //

    const { xLabels } = labels;
    const { yMax, axis, axisYSize } = dimensions;
    const index = xLabels.indexOf(point[0]);
    const coordX = coords[`x${index}`];
    const coordY = axis.zero[1] - axisYSize * (point[1] / yMax);

    return (
      <g className={styles.circleGroup}>
        <circle
          onMouseEnter={mouseEnter}
          onMouseLeave={mouseLeave}
          onClick={mousePress}
          cx={coordX}
          cy={coordY}
          r="3"
          stroke={color}
          strokeWidth="4"
          strokeOpacity="0"
          fill={color}
          style={{ transformOrigin: `${coordX}px ${coordY}px` }}
        />
        <text
          fontSize="10"
          fontWeight="bold"
          x={coordX}
          y={coordY - unit * 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
        >
          {point[1]}
        </text>
      </g>
    );
  };

  const printLabels = () => {
    const { xLabels, yLabels } = labels;
    const { axis } = dimensions;
    const positionY = axis.zero[1] + unit * 2;
    const positionX = axis.zero[0] - unit * 1.5;
    return (
      <>
        <g className={styles.x_labels} ref={labelsRef}>
          {xLabels.map((label, index) => {
            const positionX = coords[`x${index}`];
            return (
              <text
                fontSize="9"
                key={label}
                x={positionX}
                y={positionY}
                style={{
                  transform: "rotate(-45deg)",
                  transformOrigin: `${positionX}px ${positionY}px`,
                }}
                textAnchor="end"
                dominantBaseline="middle"
                fill={lineColor}
              >
                {label}
              </text>
            );
          })}
          <text
            fontSize="10"
            x={axis.xmax[0]}
            y={axis.ymax[1]}
            style={{
              transform: "translateY(-12px) translateX(-12px)",
              transformOrigin: `${axis.xmax[0]}px ${axis.ymax[1]}px`,
            }}
            alignmentBaseline="middle"
            textAnchor="end"
          >
            {labelX} →
          </text>
        </g>

        <g className={styles.y_labels}>
          {yLabels.map((label, index) => {
            return (
              <text
                fontSize="9"
                key={label}
                x={positionX}
                y={coords[`y${index}`]}
                textAnchor="end"
                alignmentBaseline="middle"
                fill={lineColor}
              >
                {label}
              </text>
            );
          })}

          <text
            fontSize="10"
            x={axis.xmax[0]}
            y={axis.ymax[1]}
            style={{
              transform: "rotate(90deg) translateY(-12px) translateX(12px)",
              transformOrigin: `${axis.xmax[0]}px ${axis.ymax[1]}px`,
            }}
            textAnchor="start"
          >
            ← {labelY}
          </text>
        </g>
      </>
    );
  };

  const printAxis = () => {
    const { axis } = dimensions;
    const yStart = axis.zero[1] + 1;
    const xStart = axis.zero[0] - 1;

    return (
      <>
        <g className={styles.axis}>
          <line
            style={{
              stroke: lineColor,
              strokeWidth: 2,
              strokeLinecap: "square",
            }}
            x1={axis.zero[0] - 1}
            y1={yStart}
            x2={axis.xmax[0]}
            y2={yStart}
          ></line>
        </g>

        <g className={[styles.grid, styles.x_grid].join(" ")}>
          <line
            x1={xStart}
            y1={axis.ymax[1]}
            x2={xStart}
            y2={axis.zero[1]}
            style={{
              stroke: lineColor,
              strokeWidth: 2,
              strokeLinecap: "square",
            }}
          />
        </g>
      </>
    );
  };

  return (
    <Block
      noMargin
      noPadding
      title={
        <span className={styles.title}>
          <span>{title}</span>
          <button
            onClick={() => {
              const exported = JSON.stringify({
                labelX,
                labelY,
                data,
                ratio,
                padding,
              });
              copy(exported);
            }}
          >
            <CopyIcon size="small" />
          </button>
        </span>
      }
    >
      <div className={styles.container}>
        <svg
          version="1.2"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.graph}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        >
          <g ref={graph} className={styles.graph}>
            <g ref={grid} className={styles.grid}>
              {printGrid()}
            </g>
            <g className={styles.axis}>{printAxis()}</g>
            <g className={styles.lines}>{printLines()}</g>
            <g className={styles.labels}>{printLabels()}</g>
          </g>
        </svg>
      </div>
    </Block>
  );
};

export default LineChart;
