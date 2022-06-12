package model;

import java.sql.*;

/*
 *
 */
public class DataBase {
    private static String JDBC_DRIVER = "com.mysql.cj.jdbc.Driver";
    private static String DB_URL = "jdbc:mysql://localhost:3306/elephant_lion" +
            "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=GMT";
    private static String DB_USER = "账户";
    private static String DB_PASS = "密码";

    private Connection getConnection() {
        Connection conn = null;
        try {
            Class.forName(JDBC_DRIVER);
            conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
        } catch (ClassNotFoundException e) {
        } catch (SQLException e) {
        }

        return conn;
    }

    private void closeConnection(ResultSet rs, PreparedStatement pst,
                                 Connection conn) {
        if (rs != null) {
            try {
                rs.close();
            } catch (SQLException e) {
            }
        }

        if (pst != null) {
            try {
                pst.close();
            } catch (SQLException e) {
            }
        }

        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
            }
        }
    }

    /*
     * 增加记录
     * table：数据表
     * fields：字段
     * values：值
     * num: 字段个数
     */
    public boolean insertRecord(String table, String fields[], String values[],
                                int num) {
        boolean result = true;
        Connection connection = getConnection();
        PreparedStatement pst = null;

        String field = fields[0];
        String value = "?";
        for (int i = 1; i < num; i++) {
            field += ",";
            field += fields[i];
            value += ",?";
        }

        String sql =
                "INSERT INTO " + table + " ( " + field + " ) VALUES ( " + value + " )";
        try {
            pst = connection.prepareStatement(sql);
            for (int i = 0; i < num; i++) {
                pst.setString(i + 1, values[i]);
            }
            pst.executeUpdate();
        } catch (SQLException e) {
            result = false;
            e.printStackTrace();
        } finally {
            closeConnection(null, pst, connection);
        }

        return result;
    }

    /*
     * 删除记录
     * table：数据表
     * field：字段，例：name
     * value：值，例：1
     */
    public boolean deleteRecord(String table, String field, String value) {
        boolean result = true;
        Connection connection = getConnection();
        PreparedStatement pst = null;

        String sql = "DELETE from " + table + " where " + field + "=? ";

        try {
            pst = connection.prepareStatement(sql);
            pst.setString(1, value);
            pst.executeUpdate();
        } catch (SQLException e) {
            result = false;
            e.printStackTrace();
        } finally {
            closeConnection(null, pst, connection);
        }

        return result;
    }

    /*
     * 修改记录
     * table：数据表
     * selectField：选择字段
     * selectValue：选择值
     * changeField：修改字段
     * changeValue：修改值
     */
    public boolean updateRecord(String table, String changeField,
                                String changeValue,
                                String selectField,
                                String selectValue) {
        boolean result = true;
        Connection connection = getConnection();
        PreparedStatement pst = null;

        String sql =
                "UPDATE " + table + " set " + changeField + "=? where " + selectField + "=? ";

        try {
            pst = connection.prepareStatement(sql);
            pst.setString(1, changeValue);
            pst.setString(2, selectValue);
            pst.executeUpdate();
        } catch (SQLException e) {
            result = false;
            e.printStackTrace();
        } finally {
            closeConnection(null, pst, connection);
        }

        return result;
    }

    /*
     * 按值查询字段
     * table：数据表
     * targetField：目标字段
     * selectField：查询字段，例：name
     * value：值，例：1
     */
    public String selectField(String table, String targetField,
                              String selectField, String value) {
        Connection connection = getConnection();
        PreparedStatement pst = null;
        ResultSet rs = null;

        String sql =
                "SELECT " + targetField + " from " + table + " WHERE " + selectField + "=?";
        String result = null;

        try {
            pst = connection.prepareStatement(sql);
            pst.setString(1, value);
            rs = pst.executeQuery();

            while (rs.next()) {
                result = rs.getString(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            closeConnection(rs, pst, connection);
        }

        return result;
    }
}
