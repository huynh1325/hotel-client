import React, { useEffect, useState } from "react";
import { Layout, Table } from "antd";
import { toast } from "react-toastify";
import { getBookingCheckedOut } from "../utils/api";
import dayjs from "dayjs";

const { Content } = Layout;

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingRes = await getBookingCheckedOut();
        setBookings(bookingRes || []);
      } catch (err) {
        toast.error("Lỗi khi tải lịch sử booking!");
      }
    };
    fetchBookings();
  }, []);

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
        <h2 style={{ marginBottom: 20 }}>Lịch sử Booking</h2>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={bookings}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </Content>
  );
};

export default BookingHistory;
