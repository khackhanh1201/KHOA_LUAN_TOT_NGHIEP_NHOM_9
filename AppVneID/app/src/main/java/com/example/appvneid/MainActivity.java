package com.example.appvneid;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONObject;

import java.io.IOException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class MainActivity extends AppCompatActivity {

    private static final String PREFS_NAME = "vneid_mobile_session";
    private static final String API_BASE = "http://192.168.1.4:9090/api";
    private static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");

    private EditText edtCccd, edtPassword;
    private Button btnLogin;
    private final OkHttpClient httpClient = new OkHttpClient();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        edtCccd = findViewById(R.id.edtCccd);
        edtPassword = findViewById(R.id.edtPassword);
        btnLogin = findViewById(R.id.btnLogin);

        // Đã có phiên đăng nhập -> vào Home luôn.
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        if (prefs.getString("auth_token", null) != null) {
            goToHome();
            return;
        }

        btnLogin.setOnClickListener(v -> handleLogin());
    }

    private void handleLogin() {
        String cccd = edtCccd.getText().toString().trim();
        String password = edtPassword.getText().toString().trim();

        if (!cccd.matches("\\d{12}")) {
            Toast.makeText(this, "CCCD phải gồm đúng 12 chữ số!", Toast.LENGTH_SHORT).show();
            return;
        }
        if (password.isEmpty()) {
            Toast.makeText(this, "Vui lòng nhập mật khẩu!", Toast.LENGTH_SHORT).show();
            return;
        }

        btnLogin.setEnabled(false);
        Toast.makeText(this, "Đang đăng nhập...", Toast.LENGTH_SHORT).show();

        try {
            JSONObject jsonBody = new JSONObject();
            jsonBody.put("cccdNumber", cccd);
            jsonBody.put("password", password);

            Request request = new Request.Builder()
                    .url(API_BASE + "/auth/login")
                    .post(RequestBody.create(jsonBody.toString(), JSON))
                    .build();

            httpClient.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    runOnUiThread(() -> {
                        btnLogin.setEnabled(true);
                        Toast.makeText(MainActivity.this, "Không kết nối được server!", Toast.LENGTH_SHORT).show();
                    });
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    String body = response.body() != null ? response.body().string() : "{}";

                    try {
                        JSONObject json = new JSONObject(body);
                        boolean success = json.optBoolean("success", false);

                        if (response.isSuccessful() && success) {
                            JSONObject data = json.optJSONObject("data");
                            if (data == null) data = new JSONObject();

                            String token = data.optString("token", "");
                            String fullName = data.optString("fullName", "Người dùng");
                            String role = data.optString("activeRole", "ROLE_CITIZEN");

                            if (token.isEmpty()) {
                                throw new RuntimeException("Không nhận được token đăng nhập");
                            }

                            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
                            prefs.edit()
                                    .putString("auth_token", token)
                                    .putString("cccd_number", cccd)
                                    .putString("full_name", fullName)
                                    .putString("role", role)
                                    .apply();

                            runOnUiThread(() -> {
                                Toast.makeText(MainActivity.this, "Đăng nhập thành công!", Toast.LENGTH_SHORT).show();
                                goToHome();
                            });
                        } else {
                            String message = json.optString("message", "Sai số định danh hoặc mật khẩu!");
                            runOnUiThread(() -> {
                                btnLogin.setEnabled(true);
                                Toast.makeText(MainActivity.this, message, Toast.LENGTH_LONG).show();
                            });
                        }
                    } catch (Exception parseError) {
                        runOnUiThread(() -> {
                            btnLogin.setEnabled(true);
                            Toast.makeText(MainActivity.this, "Phản hồi server không hợp lệ!", Toast.LENGTH_SHORT).show();
                        });
                    }
                }
            });
        } catch (Exception e) {
            btnLogin.setEnabled(true);
            Toast.makeText(this, "Không thể tạo request đăng nhập!", Toast.LENGTH_SHORT).show();
        }
    }

    private void goToHome() {
        Intent intent = new Intent(MainActivity.this, HomeActivity.class);
        startActivity(intent);
        finish();
    }
}