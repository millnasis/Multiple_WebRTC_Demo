package com.webrtcdemo.webrtcdemo.util;

public interface Constant {
    interface code {
        int error = -1;
        int success = 200;
        int sys_err = 500;
        int not_found = 404;
        int account_exist = 40301;
    }

    interface sex {
        String female = "F";
        String male = "M";
    }

    interface paper_state {
        String preparing = "PREPARING";
        String waiting = "WAITING";
        String starting = "STARTING";
        String correcting = "CORRECTING";
        String end = "END";
    }

    interface question_type {
        String choose = "CHO";
        String fill = "FIL";
        String subject = "SUB";
    }

    interface exam_paper_state {
        String ongoing = "ONGOING";
        String cheating = "CHEATING";
        // 批改中
        String correcting = "CORRECTING";
        String finished = "FINISHED";
    }

    interface signal {
        String SIGNAL_TYPE_JOIN = "join";
        String SIGNAL_TYPE_RESP_JOIN = "resp-join";
        String SIGNAL_TYPE_LEAVE = "leave";
        String SIGNAL_TYPE_NEW_PEER = "new-peer";
        String SIGNAL_TYPE_PEER_LEAVE = "peer-leave";
        String SIGNAL_TYPE_OFFER = "offer";
        String SIGNAL_TYPE_ANSWER = "answer";
        String SIGNAL_TYPE_CANDIDATE = "candidate";
    }
}
