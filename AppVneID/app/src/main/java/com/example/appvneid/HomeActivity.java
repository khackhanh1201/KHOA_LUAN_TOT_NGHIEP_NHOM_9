package com.example.appvneid;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.appcompat.app.AppCompatActivity;
import com.journeyapps.barcodescanner.ScanContract;
import com.journeyapps.barcodescanner.ScanOptions;

import org.json.JSONObject;

import java.io.IOException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class HomeActivity extends AppCompatActivity {

    private static final String PREFS_NAME = "vneid_mobile_session";
    private static final String API_BASE = "http://192.168.1.4:9090/api";
    private static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");

    private TextView tvUserName;
    private Button btnScanQR;
    private Button btnLogout;
    private final OkHttpClient httpClient = new OkHttpClient();

    private String mobileToken;
    private String cccdNumber;
    private String fullName;
    private String role;

    private final ActivityResultLauncher<ScanOptions> barcodeLauncher = registerForActivityResult(
            new ScanContract(),
            result -> {
                if (result.getContents() != null) {
                    String qrToken = result.getContents();
                    Toast.makeText(this, "Đang xác thực mã QR...", Toast.LENGTH_SHORT).show();
                    sendTokenToBackend(qrToken);
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        tvUserName = findViewById(R.id.tvUserName);
        btnScanQR = findViewById(R.id.btnScanQR);
        btnLogout = findViewById(R.id.btnLogout);

        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        mobileToken = prefs.getString("auth_token", null);
        cccdNumber = prefs.getString("cccd_number", "");
        fullName = prefs.getString("full_name", "Người dùng");
        role = prefs.getString("role", "ROLE_CITIZEN");

        if (mobileToken == null || cccdNumber == null || cccdNumber.isEmpty()) {
            Toast.makeText(this, "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.", Toast.LENGTH_SHORT).show();
            goToLogin();
            return;
        }

        tvUserName.setText(fullName + "\nCCCD: " + cccdNumber + "\n" + role);

        // Sự kiện quét QR
        btnScanQR.setOnClickListener(v -> startScanning());

        // Sự kiện Đăng xuất
        btnLogout.setOnClickListener(v -> {
            prefs.edit().clear().apply();
            goToLogin();
        });
    }

    private void startScanning() {
        ScanOptions options = new ScanOptions();
        options.setPrompt("Hướng camera vào mã QR trên Web");
        options.setBeepEnabled(true);
        options.setOrientationLocked(true);
        // Trỏ vào class ép dọc vừa tạo
        options.setCaptureActivity(PortraitCaptureActivity.class);
        barcodeLauncher.launch(options);
    }

    private void sendTokenToBackend(String qrToken) {
        try {
            JSONObject jsonBody = new JSONObject();
            jsonBody.put("qr_token", qrToken);
            jsonBody.put("cccd_number", cccdNumber);
            jsonBody.put("mobile_token", mobileToken);

            RequestBody body = RequestBody.create(jsonBody.toString(), JSON);

            Request request = new Request.Builder()
                    .url(API_BASE + "/auth/qr-confirm")
                    .post(body)
                    .build();

            httpClient.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    runOnUiThread(() -> Toast.makeText(HomeActivity.this, "Lỗi mạng!", Toast.LENGTH_SHORT).show());
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    String body = response.body() != null ? response.body().string() : "{}";
                    try {
                        JSONObject json = new JSONObject(body);
                        boolean success = json.optBoolean("success", false);
                        String message = json.optString("message",
                                response.isSuccessful() ? "Đã xác nhận QR thành công!" : "Mã QR không hợp lệ!");

                        if (response.isSuccessful() && success) {
                            runOnUiThread(() -> Toast.makeText(HomeActivity.this,
                                    "Đăng nhập Web thành công cho: " + fullName, Toast.LENGTH_LONG).show());
                        } else {
                            runOnUiThread(() -> Toast.makeText(HomeActivity.this, message, Toast.LENGTH_SHORT).show());
                        }
                    } catch (Exception e) {
                        if (response.isSuccessful()) {
                            runOnUiThread(() -> Toast.makeText(HomeActivity.this, "Đăng nhập Web thành công!", Toast.LENGTH_LONG).show());
                        } else {
                            runOnUiThread(() -> Toast.makeText(HomeActivity.this, "Mã QR không hợp lệ!", Toast.LENGTH_SHORT).show());
                        }
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            Toast.makeText(this, "Không thể gửi xác nhận QR!", Toast.LENGTH_SHORT).show();
        }
    }

    private void goToLogin() {
        Intent intent = new Intent(HomeActivity.this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}