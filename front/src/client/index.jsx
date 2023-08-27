import React from "react";
import ReactDom from "react-dom";
import { Button, Input, InputNumber, Typography } from "antd";
import MultiZeroRtc from "./MultiZeroRtc";

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      msg: "",
      date: "",
      status: "",
      roomId: null,
      renderRemoteUserId: [],
    };

    this.rtc = null;
  }

  componentDidMount() {

    this.rtc = new MultiZeroRtc(
      "/socket-join",
      () => {
        this.setState({ renderRemoteUserId: this.rtc.getRemoteUserIdList() });
      },
      () => {
        this.setState({ renderRemoteUserId: this.rtc.getRemoteUserIdList() });
      }
    );

    this.rtc.createWebsocket();
  }

  componentWillUnmount() {
    this.rtc.doLeave();
    this.rtc.hangup();
  }

  render() {
    return (
      <div>
        <Typography>
          <Typography.Paragraph>
            <Typography.Title>WEBRTC DEMO!!!</Typography.Title>
          </Typography.Paragraph>
          <Typography.Paragraph>
            <InputNumber
              controls={false}
              value={this.state.roomId}
              onChange={(v) => {
                this.setState({ roomId: v });
              }}
            ></InputNumber>
            <Button
              type="primary"
              onClick={() => {
                if (!this.state.roomId) {
                  return;
                }
                this.rtc.initLocalStream(this.state.roomId);
              }}
            >
              加入
            </Button>
            <Button
              onClick={() => {
                this.rtc.doLeave();
                this.rtc.hangup();
              }}
            >
              离开
            </Button>
          </Typography.Paragraph>
          <Typography.Paragraph>
            <video
              id="localVideo"
              autoPlay
              muted
              playsInline
              style={{ border: "1px red soild" }}
            >
              本地窗口
            </video>
            {this.state.renderRemoteUserId.map((v) => (
              <video
                key={v}
                id={"remoteVideo" + v}
                autoPlay
                playsInline
                style={{ border: "1px red soild" }}
              >
                远端窗口
              </video>
            ))}
          </Typography.Paragraph>
        </Typography>
      </div>
    );
  }
}
ReactDom.render(
  <div>
    <Home></Home>
  </div>,
  document.querySelector("#root")
);
