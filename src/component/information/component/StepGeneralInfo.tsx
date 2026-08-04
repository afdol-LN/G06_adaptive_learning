import React, { useEffect, useState } from "react";
import { InformationFormData } from "../../../models/informationModel";
import { InformationService } from "../../../services/informationService";
import { CampusDTO, FacultyDTO, MajorDTO } from "../../../models/universityModel";

interface StepGeneralInfoProps {
  formData: InformationFormData;
  setFormDataField: (field: keyof InformationFormData, value: string) => void;
}

export const StepGeneralInfo: React.FC<StepGeneralInfoProps> = ({
  formData,
  setFormDataField,
}) => {
  const [campuses, setCampuses] = useState<CampusDTO[]>([]);
  const [faculties, setFaculties] = useState<FacultyDTO[]>([]);
  const [majors, setMajors] = useState<MajorDTO[]>([]);
  const [loadError, setLoadError] = useState<string>("");

  const years = InformationService.getYearsByEdu(formData.edu);

  // 1. Fetch campuses from backend
  useEffect(() => {
    InformationService.getCampuses()
      .then((data) => setCampuses(data))
      .catch((e) => {
        console.error("Error fetching campuses from backend:", e);
        setLoadError("โหลดข้อมูลวิทยาเขตไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      });
  }, []);

  // 2. Fetch faculties from backend when campus changes
  useEffect(() => {
    if (formData.campus && campuses.length > 0) {
      const selectedCampus = campuses.find(
        (c) =>
          c.campus === formData.campus ||
          String(c.id) === String(formData.campus) ||
          String(c.campusId) === String(formData.campus)
      );
      if (selectedCampus) {
        InformationService.getFacultiesByCampus(selectedCampus.id)
          .then((data) => setFaculties(data))
          .catch((e) => {
            console.error("Error fetching faculties from backend:", e);
            setLoadError("โหลดข้อมูลคณะไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
          });
      } else {
        setFaculties([]);
      }
    } else {
      setFaculties([]);
    }
  }, [formData.campus, campuses]);

  // 3. Fetch majors from backend when faculty changes
  useEffect(() => {
    if (formData.faculty && faculties.length > 0) {
      const selectedFaculty = faculties.find(
        (f) =>
          f.facultyName === formData.faculty ||
          f.faculty === formData.faculty ||
          String(f.facultyId) === String(formData.faculty) ||
          String(f.id) === String(formData.faculty)
      );
      if (selectedFaculty) {
        const idToQuery = Number(selectedFaculty.facultyId ?? selectedFaculty.id);
        InformationService.getMajorsByFacultyId(idToQuery)
          .then((data) => setMajors(data))
          .catch((e) => {
            console.error("Error fetching majors from backend:", e);
            setLoadError("โหลดข้อมูลสาขาวิชาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
          });
      } else {
        setMajors([]);
      }
    } else {
      setMajors([]);
    }
  }, [formData.faculty, faculties]);

  return (
    <div className="panel active">
      {loadError && (
        <p style={{ color: "#f87171", fontSize: "13px", textAlign: "center", marginBottom: "12px" }}>
          {loadError}
        </p>
      )}
      <div className="field">
        <label>วิทยาเขต</label>
        <div className="select-wrap">
          <select
            value={formData.campus}
            onChange={(e) => {
              const val = e.target.value;
              setFormDataField("campus", val);
              const selected = campuses.find((c) => c.campus === val);
              setFormDataField("campusId", selected ? String(selected.id) : "");
            }}
          >
            <option value="" disabled>
              เลือกวิทยาเขต...
            </option>
            {campuses.map((c) => (
              <option key={c.id} value={c.campus}>
                {c.campus}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-row">
        <div>
          <label>คณะ</label>
          <div className="select-wrap">
            <select
              value={formData.faculty}
              onChange={(e) => {
                const val = e.target.value;
                setFormDataField("faculty", val);
                const selected = faculties.find(
                  (f) => (f.facultyName ?? f.faculty) === val
                );
                const fId = selected ? (selected.facultyId ?? selected.id) : "";
                setFormDataField("facultyId", fId !== "" ? String(fId) : "");
              }}
              disabled={!formData.campus}
            >
              <option value="" disabled>
                เลือกคณะ...
              </option>
              {faculties.map((f) => {
                const fName = f.facultyName ?? f.faculty;
                const fKey = f.facultyId ?? f.id ?? fName;
                return (
                  <option key={fKey} value={fName}>
                    {fName}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <div>
          <label>สาขาวิชา</label>
          <div className="select-wrap">
            <select
              value={formData.major}
              onChange={(e) => {
                const val = e.target.value;
                setFormDataField("major", val);
                const selected = majors.find(
                  (m) => (m.majorName ?? m.major) === val
                );
                const mId = selected ? (selected.majorId ?? selected.id) : "";
                setFormDataField("majorId", mId !== "" ? String(mId) : "");
              }}
              disabled={!formData.faculty}
            >
              <option value="" disabled>
                เลือกสาขา...
              </option>
              {formData.faculty &&
                majors.map((m) => {
                  const mName = m.majorName ?? m.major;
                  const mKey = m.majorId ?? m.id ?? mName;
                  return (
                    <option key={mKey} value={mName}>
                      {mName}
                    </option>
                  );
                })}
            </select>
          </div>
        </div>
      </div>

      <div className="field-row" style={{ justifyContent: "center" }}>
        <div>
          <label>ชั้นปี / ปีการศึกษา</label>
          <div className="select-wrap">
            <select
              value={formData.year}
              onChange={(e) => setFormDataField("year", e.target.value)}
            >
              <option value="" disabled>
                เลือกชั้นปี...
              </option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
