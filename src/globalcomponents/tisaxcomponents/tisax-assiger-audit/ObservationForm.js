import React, { useState, useEffect } from 'react';
import { toast } from "react-toastify";

const ObservationForm = () => {
  return (
    <div></div>
  );
};

export default ObservationForm;

export const AL3ObservationForm = ({
  onUpdateObservationData,
  observationData,
  fieldErrors,
  handleFieldChange,
  handleFieldBlur,
}) => {
  const [formData, setFormData] = useState({
    deviationFound: observationData.deviationFound || false,
    noDeviation: !observationData.deviationFound,
    majorNonConformity: observationData.deviationType === 'Major non-conformity' || false,
    minorNonConformity: observationData.deviationType === 'Minor non-conformity' || false,
    observation: observationData.deviationType === 'Observation' || false,
    roomForImprovement: observationData.deviationType === 'Room for improvement' || false,
    description: observationData.deviationDescription || '',
    deviationType: observationData.deviationType || '',
  });

  const handleChange = (e) => {
    const { name, checked, value } = e.target;
    let newData = { ...formData };

    if (name === 'description') {
      newData.description = value;
    } else {
      newData[name] = checked;
    }

    // Update deviationType based on the checkbox that was clicked
    if (checked && name !== 'noDeviation' && name !== 'deviationFound') {
      newData.deviationType = name === 'majorNonConformity' ? 'Major non-conformity' :
        name === 'minorNonConformity' ? 'Minor non-conformity' :
        name === 'observation' ? 'Observation' :
        name === 'roomForImprovement' ? 'Room for improvement' : '';
    }

    if (checked && (name === 'deviationFound' || name === 'noDeviation')) {
      newData = {
        ...newData,
        deviationFound: name === 'deviationFound',
        noDeviation: name === 'noDeviation',
      };
    }

    setFormData(newData);
    onUpdateObservationData(newData);
    handleFieldChange(name, name === 'description' ? value : checked);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    handleFieldBlur(name, value);
  };

  useEffect(() => {
    if (observationData && observationData.length > 0) {
      const firstObservation = observationData[0];
      setFormData({
        deviationFound: firstObservation.deviationFound || false,
        noDeviation: !firstObservation.deviationFound,
        majorNonConformity: firstObservation.deviationType === 'Major non-conformity' || false,
        minorNonConformity: firstObservation.deviationType === 'Minor non-conformity' || false,
        observation: firstObservation.deviationType === 'Observation' || false,
        roomForImprovement: firstObservation.deviationType === 'Room for improvement' || false,
        description: firstObservation.deviationDescription || '',
        deviationType: firstObservation.deviationType || '',
      });
    }
  }, [observationData]);

  return (
    <div className="p-4">
      <form>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Observation:</label>
          <div className="mb-2">
            <input
              type="checkbox"
              id="noDeviation"
              name="noDeviation"
              checked={formData.noDeviation}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="noDeviation" className="text-gray-700">Based on the observations, no deviation was found.</label>
          </div>
          <div className="mb-2">
            <input
              type="checkbox"
              id="deviationFound"
              name="deviationFound"
              checked={formData.deviationFound}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="deviationFound" className="text-gray-700">Based on the observations, deviation was found.</label>
          </div>
        </div>

        {formData.deviationFound && (
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Description:</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-300 rounded"
            />
            {fieldErrors.deviationDescription && (
              <span className="text-red-500 text-sm">{fieldErrors.deviationDescription}</span>
            )}
          </div>
        )}

        {formData.deviationFound && (
          <div className="mb-4">
            <div className="mb-2">
              <input
                type="checkbox"
                id="majorNonConformity"
                name="majorNonConformity"
                checked={formData.deviationType === 'Major non-conformity'}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="majorNonConformity" className="text-gray-700">Major non-conformity</label>
            </div>
            <div className="mb-2">
              <input
                type="checkbox"
                id="minorNonConformity"
                name="minorNonConformity"
                checked={formData.deviationType === 'Minor non-conformity'}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="minorNonConformity" className="text-gray-700">Minor non-conformity</label>
            </div>
            <div className="mb-2">
              <input
                type="checkbox"
                id="observation"
                name="observation"
                checked={formData.deviationType === 'Observation'}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="observation" className="text-gray-700">Observation</label>
            </div>
            <div className="mb-2">
              <input
                type="checkbox"
                id="roomForImprovement"
                name="roomForImprovement"
                checked={formData.deviationType === 'Room for improvement'}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="roomForImprovement" className="text-gray-700">Room for improvement</label>
            </div>
            {fieldErrors.deviationType && (
              <span className="text-red-500 text-sm">{fieldErrors.deviationType}</span>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export const AL2ObservationForm = ({
  onUpdateObservationData,
  observationData,
  fieldErrors,
  handleFieldChange,
  handleFieldBlur,
}) => {
  const [formData, setFormData] = useState({
    deviationFound: observationData.deviationFound || false,
    noDeviation: !observationData.deviationFound,
    al2Plausible: observationData.al2Plausible ?? !observationData.deviationFound,
    majorNonConformity: observationData.deviationType === 'Major non-conformity' || false,
    minorNonConformity: observationData.deviationType === 'Minor non-conformity' || false,
    observation: observationData.deviationType === 'Observation' || false,
    roomForImprovement: observationData.deviationType === 'Room for improvement' || false,
    description: observationData.deviationDescription || '',
    deviationType: observationData.deviationType || '',
  });

  useEffect(() => {
    setFormData({
      deviationFound: observationData.deviationFound || false,
      noDeviation: !observationData.deviationFound,
      al2Plausible: observationData.al2Plausible ?? !observationData.deviationFound,
      majorNonConformity: observationData.deviationType === 'Major non-conformity' || false,
      minorNonConformity: observationData.deviationType === 'Minor non-conformity' || false,
      observation: observationData.deviationType === 'Observation' || false,
      roomForImprovement: observationData.deviationType === 'Room for improvement' || false,
      description: observationData.deviationDescription || '',
      deviationType: observationData.deviationType || '',
    });
  }, [observationData]);

  const handleChange = (e) => {
    const { name, checked, value } = e.target;
    let newData = { ...formData };

    if (name === 'description') {
      newData.description = value;
    } else {
      newData[name] = checked;
    }

    if (name === 'deviationFound') {
      newData.deviationFound = checked;
      newData.noDeviation = !checked;
      newData.al2Plausible = !checked;
    } else if (name === 'noDeviation') {
      newData.noDeviation = checked;
      newData.deviationFound = !checked;
      newData.al2Plausible = checked;
    }

    if (name === 'al2Plausible' && checked) {
      newData.al2NotPlausible = false;
    } else if (name === 'al2NotPlausible' && checked) {
      newData.al2Plausible = false;
    }

    if (checked && (name === 'majorNonConformity' || name === 'minorNonConformity' || name === 'observation' || name === 'roomForImprovement')) {
      newData.deviationType = name === 'majorNonConformity' ? 'Major non-conformity' :
        name === 'minorNonConformity' ? 'Minor non-conformity' :
        name === 'observation' ? 'Observation' :
        name === 'roomForImprovement' ? 'Room for improvement' : formData.deviationType;

      newData.majorNonConformity = name === 'majorNonConformity';
      newData.minorNonConformity = name === 'minorNonConformity';
      newData.observation = name === 'observation';
      newData.roomForImprovement = name === 'roomForImprovement';
    }

    setFormData(newData);
    onUpdateObservationData(newData);
    handleFieldChange(name, name === 'description' ? value : checked);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    handleFieldBlur(name, value);
  };

  return (
    <div className="p-4">
      <form>
        <div className="mb-4">
          <input
            type="checkbox"
            id="noDeviation"
            name="noDeviation"
            checked={formData.noDeviation}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="noDeviation" className="text-gray-700">
            Based on the observations, no deviation was found.
          </label>
          <div className="mt-2">
            <input
              type="checkbox"
              id="deviationFound"
              name="deviationFound"
              checked={formData.deviationFound}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="deviationFound" className="text-gray-700">
              Based on the observations, deviation was found.
            </label>
          </div>
        </div>

        {(formData.noDeviation || formData.deviationFound) && (
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              AL2: The description of the implementation in relation to the evidences provided is
            </label>
            <div className="mb-2">
              <input
                type="checkbox"
                id="al2Plausible"
                name="al2Plausible"
                checked={formData.al2Plausible}
                onChange={handleChange}
                className="mr-2"
                disabled={formData.deviationFound}
              />
              <label htmlFor="al2Plausible" className="text-gray-700">
                Plausible
              </label>
            </div>
            <div className="mb-2">
              <input
                type="checkbox"
                id="al2NotPlausible"
                name="al2NotPlausible"
                checked={!formData.al2Plausible}
                onChange={handleChange}
                className="mr-2"
                disabled={formData.noDeviation}
              />
              <label htmlFor="al2NotPlausible" className="text-gray-700">
                Not Plausible
              </label>
            </div>
          </div>
        )}

        {formData.deviationFound && (
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Description:</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-300 rounded"
            />
            {fieldErrors.deviationDescription && (
              <span className="text-red-500 text-sm">{fieldErrors.deviationDescription}</span>
            )}
          </div>
        )}

        {formData.deviationFound && (
          <div className="mb-4">
            <div className="mb-2">
              <input
                type="checkbox"
                id="majorNonConformity"
                name="majorNonConformity"
                checked={formData.majorNonConformity}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="majorNonConformity" className="text-gray-700">Major non-conformity</label>
            </div>
            <div className="mb-2">
              <input
                type="checkbox"
                id="minorNonConformity"
                name="minorNonConformity"
                checked={formData.minorNonConformity}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="minorNonConformity" className="text-gray-700">Minor non-conformity</label>
            </div>
            <div className="mb-2">
              <input
                type="checkbox"
                id="observation"
                name="observation"
                checked={formData.observation}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="observation" className="text-gray-700">Observation</label>
            </div>
            <div className="mb-2">
              <input
                type="checkbox"
                id="RoomForImprovement"
                name="roomForImprovement"
                checked={formData.roomForImprovement}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="RoomForImprovement" className="text-gray-700">Room for improvement</label>
            </div>
            {fieldErrors.deviationType && (
              <span className="text-red-500 text-sm">{fieldErrors.deviationType}</span>
            )}
          </div>
        )}
      </form>
    </div>
  );
};
