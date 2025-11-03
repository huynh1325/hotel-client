import React, { useEffect, useState } from "react";
import { Layout, Card, Row, Col } from "antd";
import { toast } from "react-toastify";
import { getAllRooms, getBookingCheckedOut } from "../utils/api";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const { Content } = Layout;

const Statistics = () => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomRes = await getAllRooms();
        const bookingRes = await getBookingCheckedOut();

        const roomList = Array.isArray(roomRes?.data || roomRes)
          ? roomRes?.data || roomRes
          : [];
        const bookingList = Array.isArray(bookingRes?.data || bookingRes)
          ? bookingRes?.data || bookingRes
          : [];

        setRooms(roomList);
        setBookings(bookingList);

        if (bookingList.length === 0) {
          setRevenueData([]);
          setMonthlyRevenue(0);
          return;
        }

        const grouped = {};
        bookingList.forEach((b) => {
          if (!b.checkOutDate) return;
          const date = dayjs(b.checkOutDate).format("DD/MM");
          grouped[date] = (grouped[date] || 0) + (b.totalPrice || 0);
        });

        const last10Days = [];
        for (let i = 9; i >= 0; i--) {
          const d = dayjs().subtract(i, "day");
          const dateStr = d.format("DD/MM");
          last10Days.push({
            date: dateStr,
            revenue: grouped[dateStr] || 0,
          });
        }
        setRevenueData(last10Days);
        
        const currentMonth = dayjs().month();
        const currentYear = dayjs().year();
        const monthlyTotal = bookingList
          .filter(
            (b) =>
              b.checkOutDate &&
              dayjs(b.checkOutDate).month() === currentMonth &&
              dayjs(b.checkOutDate).year() === currentYear
          )
          .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        setMonthlyRevenue(monthlyTotal);
      } catch (err) {
        console.error("Fetch error:", err);
        if (err?.response?.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
        } else {
          toast.error("Lỗi khi tải dữ liệu thống kê!");
        }
      }
    };
    fetchData();
  }, []);

  const totalRooms = rooms?.length || 0;
  const bookedRooms = rooms?.filter((r) => r.status === "booked")?.length || 0;
  const availableRooms =
    rooms?.filter((r) => r.status === "available")?.length || 0;

  return (
    <Content style={{ margin: "16px" }}>
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 8,
          minHeight: 500,
        }}
      >
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
            <Card title="Doanh thu tháng hiện tại" bordered>
              {monthlyRevenue.toLocaleString()} VNĐ
            </Card>
          </Col>
        </Row>

        <h3>Doanh thu 10 ngày gần nhất</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis />
            <Bar dataKey="revenue" fill="#82ca9d">
              <LabelList
                dataKey="revenue"
                position="top"
                formatter={(value) =>
                  value > 0 ? value.toLocaleString() : ""
                }
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Content>
  );
};

export default Statistics;
