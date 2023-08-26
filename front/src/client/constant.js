export default {
  code: {
    error: -1,
    success: 200,
    sys_err: 500,
    not_found: 404,
    account_exist: 40301,
  },

  identity: {
    student: "STUDENT",
    teacher: "TEACHER",
  },

  sex: {
    female: "F",
    male: "M",
  },

  paper_state: {
    preparing: "PREPARING",
    waiting: "WAITING",
    starting: "STARTING",
    correcting: "CORRECTING",
    end: "END",
  },

  question_type: {
    choose: "CHO",
    fill: "FIL",
    subject: "SUB",
  },

  exam_paper_state: {
    ongoing: "ONGOING",
    cheating: "CHEATING",
    // 批改中
    correcting: "CORRECTING",
    finished: "FINISHED",
  },
  signal: {
    SIGNAL_TYPE_JOIN: "join",
    SIGNAL_TYPE_RESP_JOIN: "resp-join",
    SIGNAL_TYPE_LEAVE: "leave",
    SIGNAL_TYPE_NEW_PEER: "new-peer",
    SIGNAL_TYPE_PEER_LEAVE: "peer-leave",
    SIGNAL_TYPE_OFFER: "offer",
    SIGNAL_TYPE_ANSWER: "answer",
    SIGNAL_TYPE_CANDIDATE: "candidate",
  },
};
