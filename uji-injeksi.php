<?php
require 'config/database.php';
$k = $_GET['kategori'] ?? '';
$rows = db()->query("SELECT nama FROM alat WHERE kategori = '$k'")->fetchAll();
echo json_encode($rows);
