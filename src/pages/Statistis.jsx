import React, { useEffect, useState } from "react";
import { Layout, Card, Row, Col, Table } from "antd";
import { toast } from "react-toastify";
import { getAllRooms, getBookingCheckedOut } from "../utils/api";
import dayjs from "dayjs";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const { Content } = Layout;

const Statistics = () => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomRes = await getAllRooms();
        const bookingRes = await getBookingCheckedOut();

        setRooms(roomRes || []);
        setBookings(bookingRes || []);

        const grouped = {};
        bookingRes.forEach((b) => {
          const date = dayjs(b.checkOutDate).format("DD/MM");
          grouped[date] = (grouped[date] || 0) + (b.totalPrice || 0);
        });

        const chartData = Object.keys(grouped).map((date) => ({
          date,
          revenue: grouped[date],
        }));

        setRevenueData(chartData);
      } catch (err) {
        toast.error("Lỗi khi tải dữ liệu thống kê!");
      }
    };
    fetchData();
  }, []);

  const totalRooms = rooms.length;
  const bookedRooms = rooms.filter((r) => r.status === "booked").length;
  const availableRooms = rooms.filter((r) => r.status === "available").length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const columns = [
    { title: "Tên khách", dataIndex: "customerName", key: "customerName" },
    { title: "Phòng", dataIndex: "roomNumber", key: "roomNumber" },
    {
      title: "Check-in",
      dataIndex: "checkInDate",
      key: "checkInDate",
      render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Check-out",
      dataIndex: "checkOutDate",
      key: "checkOutDate",
      render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (val) => val.toLocaleString() + " VNĐ",
    },
  ];

  return (
    <Content style={{ margin: "16px" }}>
      <div style={{ background: "#fff", padding: 20, borderRadius: 8, minHeight: 500 }}>
        <h2 style={{ marginBottom: 20 }}>Thống kê hệ thống</h2>

        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={6}>
            <Card title="Tổng số phòng" bordered>
              {totalRooms}
            </Card>
          </Col>
          <Col span={6}>
            <Card title="Phòng đang đặt" bordered>
              {bookedRooms}
            </Card>
          </Col>
          <Col span={6}>
            <Card title="Phòng trống" bordered>
              {availableRooms}
            </Card>
          </Col>
          <Col span={6}>
            <Card title="Tổng doanh thu" bordered>
              {totalRevenue.toLocaleString()} VNĐ
            </Card>
          </Col>
        </Row>

        <h3>Doanh thu theo ngày</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>

        <h3 style={{ marginTop: 20 }}>Danh sách booking</h3>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={bookings}
          pagination={{ pageSize: 5 }}
        />
      </div>
    </Content>
  );
};

export default Statistics;
