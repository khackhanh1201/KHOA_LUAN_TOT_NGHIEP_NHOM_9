package com.thanglong.vneid.infrastructure.adapter.external;

import com.google.firebase.FirebaseApp;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Tích hợp Firebase Realtime Database để đồng bộ dữ liệu công dân.
 */
@Service
public class FirebaseAdapter {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(FirebaseAdapter.class);


    /**
     * Đồng bộ thông tin công dân lên Firebase.
     */
    public void syncCitizenToFirebase(String cccdNumber, Map<String, Object> citizenData) {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                log.warn("FirebaseApp chưa được khởi tạo");
                return;
            }

            DatabaseReference ref = FirebaseDatabase.getInstance()
                    .getReference("citizens")
                    .child(cccdNumber);

            ref.setValueAsync(citizenData);
            log.info("Synced citizen {} to Firebase", cccdNumber);
        } catch (Exception e) {
            log.error("Error syncing citizen {} to Firebase: {}", cccdNumber, e.getMessage());
        }
    }
}
