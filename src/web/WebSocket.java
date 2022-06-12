package web;


import com.alibaba.fastjson.JSONObject;
import model.DataBase;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

/**
 * 1, WebSocket可以通过注解的方式声明  @ServerEndpoint("/WebSocket")
 * 2, 添加注解之后需要在配置文件中返回, 在配置文件中可以过滤
 * 3, WebSocket 和 Servlet 相同都是多列的, 不会互相干扰
 * 4, WebSocket 请求时访问 open  方法, 可以用注解 @OnOpen 标明
 * 5, WebSocket 关闭时访问 close 方法, 可以用注解 @OnClose 表名
 */
@ServerEndpoint("/WebSocket")
public class WebSocket {
    private DataBase dataBase = new DataBase();
    private static Map<String, WebSocket> clients = new ConcurrentHashMap<String, WebSocket>();
    private String userid;
    private Session session;

    private String randomStr(int len) {
        Random random = new Random();
        String str = " ";

        for (int i = 0; i < len; i++) {
            str += random.nextInt(10);
        }

        return str.trim();
    }

    @OnOpen
    public void open(Session session) {
        this.userid = session.getId();
        this.session = session;

        clients.put(userid, this);
    }

    @OnClose
    public void close(Session session) {
        String id = session.getId();

        dataBase.deleteRecord("user", "user0", id);
        dataBase.deleteRecord("user", "user1", id);

        clients.remove(userid);
    }

    @OnMessage
    public void message(Session session, String msg) {
        JSONObject jsonObject = new JSONObject();
        String returnMessage = "null";

        JSONObject jsonObjectAnother = new JSONObject();
        String returnMessageToAnother = "null";

        String id = session.getId();
        String state = msg.split("::")[0];

        if (state.equals("create")) {
            String id_code = randomStr(6);

            while (dataBase.selectField("user", "id_code", "id_code", id_code) != null) {
                id_code = randomStr(6);
            }

            dataBase.insertRecord("user", new String[]{"id_code", "user0"}, new String[]{id_code, id}, 2);

            jsonObject.put("state", "create");
            jsonObject.put("value", id_code);
        } else if (state.equals("join")) {
            String id_code = msg.split("::")[1];

            //该id_code不存在
            if (dataBase.selectField("user", "id_code", "id_code", id_code) == null) {
                jsonObject.put("state", "join");
                jsonObject.put("value", "not exist");
            } else {
                if (dataBase.selectField("user", "user1", "id_code", id_code) == null) {
                    dataBase.updateRecord("user", "user1", id, "id_code", id_code);

                    jsonObjectAnother.put("state", "connected");

                    jsonObject.put("state", "join");
                    jsonObject.put("value", "ok");

                    String userAnother = dataBase.selectField("user", "user0", "id_code", id_code);
                    for (WebSocket item : clients.values()) {
                        if (item.userid.equals(userAnother)) {
                            item.session.getAsyncRemote().sendText(jsonObjectAnother.toJSONString());
                        }
                    }
                } else {
                    //该对局人数已满
                    jsonObject.put("state", "join");
                    jsonObject.put("value", "existed");
                }
            }
        }else if(state.equals("update")){
            String pieces = msg.split("::")[1];

            String userAnother = dataBase.selectField("user", "user0", "user1", id);
            if(userAnother == null){
                userAnother = dataBase.selectField("user", "user1", "user0", id);
            }

            jsonObjectAnother.put("state", "update");
            jsonObjectAnother.put("pieces", pieces);
            jsonObjectAnother.put("active",msg.split("::")[2]);

            for (WebSocket item : clients.values()) {
                if (item.userid.equals(userAnother)) {
                    item.session.getAsyncRemote().sendText(jsonObjectAnother.toJSONString());
                }
            }
        }else if(state.equals("over")){
            String userAnother = dataBase.selectField("user", "user0", "user1", id);
            if(userAnother == null){
                userAnother = dataBase.selectField("user", "user1", "user0", id);
            }

            jsonObjectAnother.put("state", "over");
            jsonObjectAnother.put("value", msg.split("::")[1]);

            for (WebSocket item : clients.values()) {
                if (item.userid.equals(userAnother)) {
                    item.session.getAsyncRemote().sendText(jsonObjectAnother.toJSONString());
                }
            }
        }else if(state.equals("restart")){
            String userAnother = dataBase.selectField("user", "user0", "user1", id);
            if(userAnother == null){
                userAnother = dataBase.selectField("user", "user1", "user0", id);
            }

            jsonObjectAnother.put("state", "restart");
            jsonObjectAnother.put("value", msg.split("::")[1]);

            for (WebSocket item : clients.values()) {
                if (item.userid.equals(userAnother)) {
                    item.session.getAsyncRemote().sendText(jsonObjectAnother.toJSONString());
                }
            }
        }

        returnMessage = jsonObject.toJSONString();

        if (!returnMessage.equals("null")) {
            session.getAsyncRemote().sendText(returnMessage);
        }
    }
}