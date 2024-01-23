import React from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: true,
  theme: "base",
  securityLevel: "loose",
});

export default class Mermaid extends React.Component {
  componentDidMount() {
    mermaid.contentLoaded();
  }
  render() {
    return <div id={"mermaidchart" + this.props.uid} className="mermaid">{this.props.chart}</div>;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.chart !== this.props.chart) {
      document
        .getElementById("mermaidchart" + this.props.uid)
        .removeAttribute("data-processed");
      mermaid.contentLoaded();
    }
  }
}
