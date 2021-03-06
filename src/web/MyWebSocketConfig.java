package web;

import java.util.Set;

import javax.websocket.Endpoint;
import javax.websocket.server.ServerApplicationConfig;
import javax.websocket.server.ServerEndpointConfig;

/**
 * 1, webSocket 的配置类, 需要实现接口 ServerApplicationConfig
 * 2, webSocket 类在扫描到之后根据需要在实现的方法中进行一定的过滤, 返回过滤后的才能被前端访问
 * 3, getAnnotatedEndpointClasses 基于注解的 webSocket 扫描方法
 * 4, getEndpointConfigs 基于 XML 配置文件的的 webSocket 扫描方法
 */
public class MyWebSocketConfig implements ServerApplicationConfig {
    public Set<Class<?>> getAnnotatedEndpointClasses(Set<Class<?>> webSockets) {
        return webSockets;
    }
    public Set<ServerEndpointConfig> getEndpointConfigs(Set<Class<? extends Endpoint>> arg0) {
        return null;
    }
}
